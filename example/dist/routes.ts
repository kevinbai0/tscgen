import { FindPetsRoute } from './routes/FindPetsRoute';
import { AddPetRoute } from './routes/AddPetRoute';
import { FindByPetIdRoute } from './routes/FindByPetIdRoute';
import { DeletePetRoute } from './routes/DeletePetRoute';

export type Route =
  | FindPetsRoute
  | AddPetRoute
  | FindByPetIdRoute
  | DeletePetRoute;

export type Routes = {
  FindPetsRoute: FindPetsRoute;
  AddPetRoute: AddPetRoute;
  FindByPetIdRoute: FindByPetIdRoute;
  DeletePetRoute: DeletePetRoute;
};

export const routesData: {
  [Key in keyof Routes]: {
    route: Routes[Key]['path'];
    method: Routes[Key]['method'];
  };
} = {
  FindPetsRoute: { route: '/pets', method: 'get' },
  AddPetRoute: { route: '/pets', method: 'post' },
  FindByPetIdRoute: { route: '/pets/{id}', method: 'get' },
  DeletePetRoute: { route: '/pets/{id}', method: 'delete' },
};
