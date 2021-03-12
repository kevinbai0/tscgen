export function createRequest<Response>(
  path: string,
  options: {
    body?: Record<string, unknown>;
    query?: Record<string, string | string[]>;
  }
) {
  return {} as Promise<Response>;
}
