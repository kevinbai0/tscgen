import {Pet} from '../models/Pet';
import {Error} from '../models/Error';

 export interface findPets {method: 'get';path: '/pets';params: undefined;query: {tags?: string;limit?: string};requestBody: undefined;responses: {status: 200;data: Pet[]}|{status: number;data: Error}}