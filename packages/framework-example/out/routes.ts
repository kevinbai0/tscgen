import { AddPetRoute } from './routes/AddPetRoute';
import { DeletePetRoute } from './routes/DeletePetRoute';
import { FindByPetIdRoute } from './routes/FindByPetIdRoute';
import { FindPetsRoute } from './routes/FindPetsRoute';

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

export type RoutesData = {
  [Key in keyof Routes]: {
    route: Routes[Key]['path'];
    method: Routes[Key]['method'];
  };
};

export const routesData: RoutesData = {
  FindPetsRoute: { route: '/pets', method: 'get' },
  AddPetRoute: { route: '/pets', method: 'post' },
  FindByPetIdRoute: { route: '/pets/{id}', method: 'get' },
  DeletePetRoute: { route: '/pets/{id}', method: 'delete' },
};
