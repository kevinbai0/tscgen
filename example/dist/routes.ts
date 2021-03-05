import { IPetModel } from './models/Pet';
import { INewPetModel } from './models/NewPet';
import { IErrorModel } from './models/Error';

export type Route = IPetModel | INewPetModel | IErrorModel;

export type Routes = {
  IPetModel: IPetModel;
  INewPetModel: INewPetModel;
  IErrorModel: IErrorModel;
};
