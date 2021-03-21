import { Error } from '../models/Error';
import { Pet } from '../models/Pet';

export interface findByPetId {
  method: 'get';
  path: '/pets/{id}';
  params: { id: string };
  query: undefined;
  requestBody: undefined;
  responses: { status: 200; data: Pet } | { status: number; data: Error };
}
