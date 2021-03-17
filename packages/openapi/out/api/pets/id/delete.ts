import { createRequest } from '../../../request';
import { ResponseMessage } from '../../../ResponseMessage';
import { DeletePetRoute } from '../../../routes/DeletePetRoute';

export default (id: string) =>
  createRequest<ResponseMessage<DeletePetRoute['responses']>>(`/pets/${id}`, {
    method: `delete`,
  });
