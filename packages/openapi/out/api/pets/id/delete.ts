import {createRequest} from '../../../createRequest';
import {ResponseMessage} from '../../../ResponseMessage';
import {deletePet} from '../../../routes/deletePet';

export default (id:string) => createRequest<ResponseMessage<deletePet['responses']>>(`/pets/${id}`,{method: `delete`})