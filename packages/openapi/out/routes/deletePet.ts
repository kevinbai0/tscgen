import { Error } from '../models/Error';

export interface deletePet {
  method: 'delete';
  path: '/pets/{id}';
  params: { id: string };
  query: undefined;
  requestBody: undefined;
  responses: { status: 204; data: undefined } | { status: number; data: Error };
}
