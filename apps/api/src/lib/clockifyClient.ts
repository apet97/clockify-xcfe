import { randomUUID } from 'node:crypto';
import { CONFIG } from '../config/index.js';
import { rateLimiter } from './rateLimiter.js';
import { logger } from './logger.js';
import { ClockifyTimeEntry, clockifyTimeEntrySchema } from '../types/clockify.js';

const REGION_HOSTS: Record<string, string> = {
  euc1: 'https://euc1-api.clockify.me/api/v1',
  use2: 'https://use2-api.clockify.me/api/v1',
  euw2: 'https://euw2-api.clockify.me/api/v1',
  apse2: 'https://apse2-api.clockify.me/api/v1'
};

const REPORT_REGION_HOSTS: Record<string, string> = {
  euc1: 'https://euc1-reports.api.clockify.me/v1',
  use2: 'https://use2-reports.api.clockify.me/v1',
  euw2: 'https://euw2-reports.api.clockify.me/v1',
  apse2: 'https://apse2-reports.api.clockify.me/v1'
};

type RequestOptions = {
  method?: string;
  path: string;
  body?: unknown;
  correlationId?: string;
  query?: Record<string, string | number | undefined>;
  authToken?: string;
};

class RateLimitError extends Error {
  constructor(message: string, public readonly retryAfterMs?: number) {
    super(message);
    this.name = 'RateLimitError';
  }
}

class ClockifyHttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown,
    public readonly correlationId?: string
  ) {
    super(message);
    this.name = 'ClockifyHttpError';
  }
}

const extractWorkspaceKey = (path: string): string => {
  const match = path.match(/\/workspaces\/([^\/]+)/);
  return match ? match[1] : 'global';
};

const buildBaseUrl = () => {
  if (CONFIG.CLOCKIFY_REGION) {
    const regionHost = REGION_HOSTS[CONFIG.CLOCKIFY_REGION];
    if (regionHost) return regionHost;
    logger.warn({ region: CONFIG.CLOCKIFY_REGION }, 'Unknown region override supplied, falling back to base URL');
  }
  return CONFIG.CLOCKIFY_BASE_URL;
};

const buildReportsBaseUrl = () => {
  if (CONFIG.CLOCKIFY_REGION) {
    const host = REPORT_REGION_HOSTS[CONFIG.CLOCKIFY_REGION];
    if (host) return host;
    logger.warn({ region: CONFIG.CLOCKIFY_REGION }, 'Unknown reports region supplied, using default');
  }
  if (CONFIG.CLOCKIFY_BASE_URL && CONFIG.CLOCKIFY_BASE_URL.includes('api.clockify.me')) {
    return CONFIG.CLOCKIFY_BASE_URL.replace('api.clockify.me/api/v1', 'reports.api.clockify.me/v1');
  }
  return 'https://reports.api.clockify.me/v1';
};

const serializeQuery = (query?: RequestOptions['query']) => {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;
    params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

const parseJsonSafe = (text: string) => {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch (error) {
    logger.warn({ err: error, text }, 'Failed to parse JSON payload from Clockify');
    return undefined;
  }
};

const computeRetryDelayMs = (retryAfterHeader?: string | null) => {
  if (!retryAfterHeader) return undefined;
  const numeric = Number(retryAfterHeader);
  if (!Number.isFinite(numeric)) return undefined;
  return numeric * 1000;
};

export class ClockifyClient {
  private readonly baseUrl = buildBaseUrl();
  private readonly reportsBaseUrl = buildReportsBaseUrl();

  private getHeaders(correlationId?: string, authToken?: string) {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };
    // Priority: per-request token > env ADDON_TOKEN > env API_KEY
    if (authToken) {
      headers['X-Addon-Token'] = authToken;
    } else {
      if (CONFIG.ADDON_TOKEN) headers['X-Addon-Token'] = CONFIG.ADDON_TOKEN;
      if (CONFIG.API_KEY) headers['X-Api-Key'] = CONFIG.API_KEY;
    }
    const requestId = randomUUID();
    headers['X-Request-Id'] = requestId;
    headers['X-Correlation-Id'] = correlationId ?? requestId;
    return headers;
  }

  private async rawRequest<T>({ method = 'GET', path, body, query, correlationId, authToken }: RequestOptions, baseUrlOverride?: string): Promise<T> {
    const url = new URL(path + serializeQuery(query), baseUrlOverride || this.baseUrl).toString();
    const headers = this.getHeaders(correlationId, authToken);
    const requestInit: RequestInit = {
      method,
      headers
    };
    if (body !== undefined) {
      requestInit.body = JSON.stringify(body);
    }

    // Log request details for debugging
    logger.debug({
      url,
      method,
      hasAuthToken: !!authToken,
      authTokenLength: authToken?.length,
      headers: { ...headers, 'X-Addon-Token': authToken ? `${authToken.substring(0, 20)}...` : undefined }
    }, 'Making Clockify API request');

    const response = await fetch(url, requestInit);
    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    const json = parseJsonSafe(text);

    if (response.status === 429) {
      const retryAfterMs = computeRetryDelayMs(response.headers.get('Retry-After')) ?? 1000;
      throw new RateLimitError('Clockify rate limit exceeded', retryAfterMs);
    }

    if (!response.ok) {
      throw new ClockifyHttpError(`Clockify request failed with status ${response.status}`, response.status, json, correlationId);
    }

    // Check for non-JSON responses (OK status but no valid JSON)
    if (json === undefined && text.length > 0) {
      const snippet = text.substring(0, 200);
      throw new ClockifyHttpError(`Non-JSON response from Clockify: ${snippet}`, 502, undefined, correlationId);
    }

    return json as T;
  }

  async request<T>(options: RequestOptions, baseUrlOverride?: string): Promise<T> {
    const correlationId = options.correlationId ?? randomUUID();
    const key = extractWorkspaceKey(options.path);
    return rateLimiter.schedule(key, async () => this.rawRequest<T>({ ...options, correlationId }, baseUrlOverride));
  }

  async getTimeEntry(
    workspaceId: string,
    entryId: string,
    correlationId?: string,
    authToken?: string
  ): Promise<ClockifyTimeEntry> {
    const payload = await this.request<unknown>({
      method: 'GET',
      path: `/workspaces/${workspaceId}/time-entries/${entryId}`,
      correlationId,
      authToken
    });
    const parsed = clockifyTimeEntrySchema.parse(payload);
    return parsed;
  }

  async patchTimeEntryCustomFields(
    workspaceId: string,
    entryId: string,
    body: { customFieldValues: { customFieldId: string; value: unknown }[] },
    options?: { correlationId?: string; ifMatch?: string; authToken?: string }
  ) {
    await this.request<unknown>({
      method: 'PATCH',
      path: `/workspaces/${workspaceId}/time-entries/${entryId}`,
      body,
      correlationId: options?.correlationId,
      authToken: options?.authToken,
      query: undefined
    });
  }

  async listWebhooks(workspaceId: string, addonId: string) {
    return this.request<{ id: string; event: string; url: string }[]>({
      method: 'GET',
      path: `/workspaces/${workspaceId}/addons/${addonId}/webhooks`
    });
  }

  async createWebhook(workspaceId: string, addonId: string, body: { url: string; events: string[] }) {
    return this.request<{ id: string }>({
      method: 'POST',
      path: `/workspaces/${workspaceId}/addons/${addonId}/webhooks`,
      body
    });
  }

  async deleteWebhook(workspaceId: string, addonId: string, webhookId: string) {
    await this.request<unknown>({
      method: 'DELETE',
      path: `/workspaces/${workspaceId}/addons/${addonId}/webhooks/${webhookId}`
    });
  }

  async getDetailedReport(
    workspaceId: string,
    params: {
      dateRangeStart: string;
      dateRangeEnd: string;
      users?: { ids: string[] };
      exportType?: string;
      hydrate?: boolean;
      page?: number;
      pageSize?: number;
    },
    correlationId?: string,
    authToken?: string
  ) {
    // Build proper Detailed Report API request structure
    // Based on: CLOCKIFY_DETAILED_REPORT_API_COMPLETE_GUIDE.md
    const body = {
      dateRangeStart: params.dateRangeStart,
      dateRangeEnd: params.dateRangeEnd,
      detailedFilter: {
        page: params.page || 1,
        pageSize: Math.min(params.pageSize || 200, 200), // Cap at 200 (API limit)
        sortColumn: "DATE", // Consistent sorting for pagination
        options: {
          totals: "CALCULATE"
        }
      },
      exportType: params.exportType || "JSON",
      sortOrder: "DESCENDING", // Most recent first
      ...(params.users && { users: params.users })
    };

    // Use Reports API endpoint (different from regular API)

    return this.request<{
      timeEntries: Array<{ id: string; [key: string]: unknown }>;
      totals: Array<{ [key: string]: unknown }>;
    }>({
      method: 'POST',
      path: `/workspaces/${workspaceId}/reports/detailed`,
      body,
      correlationId,
      authToken
    }, this.reportsBaseUrl);
  }

  async getCustomFields(workspaceId: string, correlationId?: string, authToken?: string, baseUrl?: string) {
    return this.request<Array<{ id: string; name: string; type?: string }>>({
      method: 'GET',
      path: `/workspaces/${workspaceId}/custom-fields`,
      correlationId,
      authToken
    }, baseUrl);
  }
}

export const clockifyClient = new ClockifyClient();

export { ClockifyHttpError, RateLimitError };
