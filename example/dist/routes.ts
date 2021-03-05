import { Route1 } from './models/Route1';
import { Route2 } from './models/Route2';

export type Route = Route1 | Route2;

export type Routes = { Route1: Route1; Route2: Route2 };
