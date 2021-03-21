import {createRequest} from '../../createRequest';
import {ResponseMessage} from '../../ResponseMessage';
import {addPet} from '../../routes/addPet';

export default (data:addPet['requestBody']) => createRequest<ResponseMessage<addPet['responses']>>(`/pets`,{body: data,method: `post`})