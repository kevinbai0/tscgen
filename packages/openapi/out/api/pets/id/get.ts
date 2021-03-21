import {createRequest} from '../../../createRequest';
import {ResponseMessage} from '../../../ResponseMessage';
import {findByPetId} from '../../../routes/findByPetId';

export default (id:string) => createRequest<ResponseMessage<findByPetId['responses']>>(`/pets/${id}`,{method: `get`})