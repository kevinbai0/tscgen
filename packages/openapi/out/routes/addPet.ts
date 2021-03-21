import {NewPet} from '../models/NewPet';
import {Pet} from '../models/Pet';
import {Error} from '../models/Error';

 export interface addPet {method: 'post';path: '/pets';params: undefined;query: undefined;requestBody: NewPet;responses: {status: 200;data: Pet}|{status: number;data: Error}}