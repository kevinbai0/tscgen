import { INewPetModel } from '../models/INewPetModel';

export type AddPetRoute = {
  method: 'post';
  path: '/pets';
  params: undefined;
  query: undefined;
  requestBody: INewPetModel;
  combined: INewPetModel;
};
