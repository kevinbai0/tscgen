import fetch from 'cross-fetch';
import qs from 'query-string';

export function createRequest<Response>(
  path: string,
  options: {
    method: 'get' | 'post' | 'delete' | 'put';
    body?: Record<string, unknown>;
    query?: Record<string, string | string[] | undefined>;
  }
) {
  const query = options.query ? `?${qs.stringify(options.query)}` : '';
  return fetch(`${path}${query}`, {
    method: options.method,
    ...(options.body
      ? {
          body: JSON.stringify(options.body),
        }
      : {}),
  }).then((res) => res.json()) as Promise<Response>;
}
