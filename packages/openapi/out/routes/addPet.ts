import { Error } from '../models/Error';
import { NewPet } from '../models/NewPet';
import { Pet } from '../models/Pet';

export interface addPet {
  method: 'post';
  path: '/pets';
  params: undefined;
  query: undefined;
  requestBody: NewPet;
  responses: { status: 200; data: Pet } | { status: number; data: Error };
}
