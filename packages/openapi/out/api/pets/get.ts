import {createRequest} from '../../createRequest';
import {ResponseMessage} from '../../ResponseMessage';
import {findPets} from '../../routes/findPets';

export default (data:findPets['query']) => createRequest<ResponseMessage<findPets['responses']>>(`/pets`,{query: data,method: `get`})