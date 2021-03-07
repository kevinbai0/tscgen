import { INewPetModel } from '../models/INewPetModel';

export interface AddPetRoute {
  method: 'post';
  path: '/pets';
  params: undefined;
  query: undefined;
  requestBody: INewPetModel;
}
