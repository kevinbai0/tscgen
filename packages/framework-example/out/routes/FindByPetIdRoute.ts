import { IErrorModel } from '../models/IErrorModel';
import { IPetModel } from '../models/IPetModel';

export interface FindByPetIdRoute {
  method: 'get';
  path: '/pets/{id}';
  params: { id: string };
  query: undefined;
  requestBody: undefined;
  responses:
    | { status: 200; data: IPetModel }
    | { status: number; data: IErrorModel };
}
