const defaultBase = 'http://localhost:8080/v1';
const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? defaultBase;

const normalize = (path: string) => {
  if (path.startsWith('http')) return path;
  return `${baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
};

type RequestInitExt = Omit<RequestInit, 'body'> & { body?: unknown };

export const apiRequest = async <T>(token: string | null, path: string, init: RequestInitExt = {}): Promise<T> => {
  const normalized = normalize(path);

  let url: URL;
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    url = new URL(normalized);
  } else {
    url = new URL(normalized, window.location.origin);
  }

  const headers = new Headers(init.headers as HeadersInit | undefined);
  headers.set('Accept', 'application/json');

  const isJsonBody = init.body && !(init.body instanceof FormData) && typeof init.body !== 'string';
  if (isJsonBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const requestInit: RequestInit = {
    ...init,
    headers,
    body: isJsonBody ? JSON.stringify(init.body) : (init.body as BodyInit | undefined)
  };

  const response = await fetch(url.toString(), requestInit);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }
  const contentType = response.headers.get('Content-Type') ?? '';
  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }
  return undefined as T;
};
