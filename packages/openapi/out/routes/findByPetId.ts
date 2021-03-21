import {Pet} from '../models/Pet';
import {Error} from '../models/Error';

 export interface findByPetId {method: 'get';path: '/pets/{id}';params: {id: string};query: undefined;requestBody: undefined;responses: {status: 200;data: Pet}|{status: number;data: Error}}