import type { ApiResponse, SupportedLocale } from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const API_TIMEOUT = Number(process.env.NEXT_PUBLIC_API_TIMEOUT ?? 15000);

class ApiTimeoutError extends Error {}

function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...init, signal: controller.signal })
    .finally(() => clearTimeout(timeout))
    .catch((err) => {
      if (err?.name === 'AbortError' || err?.code === 'ABORT_ERROR') {
        throw new ApiTimeoutError(`Request timeout after ${timeoutMs}ms`);
      }
      throw err;
    });
}

export async function apiFetch<T>(
  path: string,
  options?: { lang?: SupportedLocale; next?: RequestInit['next'] }
): Promise<T> {
  const url = new URL(path, API_URL);
  if (options?.lang) url.searchParams.set('lang', options.lang);

  const isDev = process.env.NODE_ENV === 'development';
  const init: RequestInit = isDev
    ? { cache: 'no-store' }
    : { next: options?.next ?? { revalidate: 3600 } };

  const res = await fetchWithTimeout(url.toString(), init, API_TIMEOUT);

  const text = await res.text();
  let json: ApiResponse<T> | null = null;

  try {
    json = JSON.parse(text) as ApiResponse<T>;
  } catch {
    if (!res.ok) {
      throw new Error(`API ${res.status}: ${text.slice(0, 120)}`);
    }
    throw new Error('API returned non-JSON response');
  }

  if (!json?.ok) {
    throw new Error(json?.error?.message ?? 'Unknown API error');
  }

  return json.data;
}
