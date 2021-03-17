import { createRequest } from '../../request';
import { ResponseMessage } from '../../ResponseMessage';
import { AddPetRoute } from '../../routes/AddPetRoute';

export default (data: AddPetRoute['requestBody']) =>
  createRequest<ResponseMessage<AddPetRoute['responses']>>(`/pets`, {
    body: data,
    method: `post`,
  });
