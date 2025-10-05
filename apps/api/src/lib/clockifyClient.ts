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

type RequestOptions = {
  method?: string;
  path: string;
  body?: unknown;
  correlationId?: string;
  query?: Record<string, string | number | undefined>;
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

const buildBaseUrl = () => {
  if (CONFIG.CLOCKIFY_REGION) {
    const regionHost = REGION_HOSTS[CONFIG.CLOCKIFY_REGION];
    if (regionHost) return regionHost;
    logger.warn({ region: CONFIG.CLOCKIFY_REGION }, 'Unknown region override supplied, falling back to base URL');
  }
  return CONFIG.CLOCKIFY_BASE_URL;
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

  private getHeaders(correlationId?: string) {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };
    if (CONFIG.ADDON_TOKEN) headers['X-Addon-Token'] = CONFIG.ADDON_TOKEN;
    if (CONFIG.API_KEY) headers['X-Api-Key'] = CONFIG.API_KEY;
    const requestId = randomUUID();
    headers['X-Request-Id'] = requestId;
    headers['X-Correlation-Id'] = correlationId ?? requestId;
    return headers;
  }

  private async rawRequest<T>({ method = 'GET', path, body, query, correlationId }: RequestOptions): Promise<T> {
    const url = new URL(path + serializeQuery(query), this.baseUrl).toString();
    const requestInit: RequestInit = {
      method,
      headers: this.getHeaders(correlationId)
    };
    if (body !== undefined) {
      requestInit.body = JSON.stringify(body);
    }

    const response = await fetch(url, requestInit);
    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    const json = parseJsonSafe(text);

    if (response.status === 429) {
      const retryAfterMs = computeRetryDelayMs(response.headers.get('Retry-After'));
      throw new RateLimitError('Clockify rate limit exceeded', retryAfterMs);
    }

    if (!response.ok) {
      throw new ClockifyHttpError(`Clockify request failed with status ${response.status}`, response.status, json, correlationId);
    }

    return json as T;
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const correlationId = options.correlationId ?? randomUUID();
    return rateLimiter.schedule(async () => this.rawRequest<T>({ ...options, correlationId }));
  }

  async getTimeEntry(workspaceId: string, entryId: string, correlationId?: string): Promise<ClockifyTimeEntry> {
    const payload = await this.request<unknown>({
      method: 'GET',
      path: `/workspaces/${workspaceId}/time-entries/${entryId}`,
      correlationId
    });
    const parsed = clockifyTimeEntrySchema.parse(payload);
    return parsed;
  }

  async patchTimeEntryCustomFields(
    workspaceId: string,
    entryId: string,
    body: { customFieldValues: { customFieldId: string; value: unknown }[] },
    options?: { correlationId?: string; ifMatch?: string }
  ) {
    await this.request<unknown>({
      method: 'PATCH',
      path: `/workspaces/${workspaceId}/time-entries/${entryId}`,
      body,
      correlationId: options?.correlationId,
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
}

export const clockifyClient = new ClockifyClient();

export { ClockifyHttpError, RateLimitError };
