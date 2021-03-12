import { IErrorModel } from '../models/IErrorModel';
import { INewPetModel } from '../models/INewPetModel';
import { IPetModel } from '../models/IPetModel';

export interface AddPetRoute {
  method: 'post';
  path: '/pets';
  params: undefined;
  query: undefined;
  requestBody: INewPetModel;
  responses:
    | { status: 200; data: IPetModel }
    | { status: number; data: IErrorModel };
}
