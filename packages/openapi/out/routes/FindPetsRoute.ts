import { IErrorModel } from '../models/IErrorModel';
import { IPetModel } from '../models/IPetModel';

export interface FindPetsRoute {
  method: 'get';
  path: '/pets';
  params: undefined;
  query: { tags?: string; limit?: string };
  requestBody: undefined;
  responses:
    | { status: 200; data: IPetModel[] }
    | { status: number; data: IErrorModel };
}
