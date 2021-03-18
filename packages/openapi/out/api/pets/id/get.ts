import { createRequest } from '../../../request';
import { ResponseMessage } from '../../../ResponseMessage';
import { FindByPetIdRoute } from '../../../routes/FindByPetIdRoute';

export default (id: string) =>
  createRequest<ResponseMessage<FindByPetIdRoute['responses']>>(`/pets/${id}`, {
    method: `get`,
  });
