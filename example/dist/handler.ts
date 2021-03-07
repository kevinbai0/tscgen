import { Routes, routesData } from './routes';

declare function fetch<T>(
  path: string,
  requestInit?: {
    method?: 'post' | 'get' | 'delete' | 'put';
    body?: Record<string, unknown>;
  }
): Promise<T>;

type RoutesData = typeof routesData;

export const request = <T extends keyof RoutesData>(route: RoutesData[T]) => {
  return fetch<Routes[T]['requestBody']>(route.route);
};
