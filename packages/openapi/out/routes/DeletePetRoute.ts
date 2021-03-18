import { IErrorModel } from '../models/IErrorModel';

export interface DeletePetRoute {
  method: 'delete';
  path: '/pets/{id}';
  params: { id: string };
  query: undefined;
  requestBody: undefined;
  responses:
    | { status: 204; data: undefined }
    | { status: number; data: IErrorModel };
}
