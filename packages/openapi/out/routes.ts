import { addPet } from './routes/addPet';
import { deletePet } from './routes/deletePet';
import { findByPetId } from './routes/findByPetId';
import { findPets } from './routes/findPets';

export type Route = findPets | addPet | findByPetId | deletePet;

export type Routes = {
  findPets: findPets;
  addPet: addPet;
  findByPetId: findByPetId;
  deletePet: deletePet;
};

export type RoutesData = {
  [Key in keyof Routes]: {
    route: Routes[Key]['path'];
    method: Routes[Key]['method'];
  };
};

export const routesData: RoutesData = {
  findPets: { route: `/pets`, method: `get` },
  addPet: { route: `/pets`, method: `post` },
  findByPetId: { route: `/pets/{id}`, method: `get` },
  deletePet: { route: `/pets/{id}`, method: `delete` },
};
