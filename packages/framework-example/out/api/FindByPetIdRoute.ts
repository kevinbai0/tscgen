import { createRequest } from '../request';
import { ResponseMessage } from '../ResponseMessage';
import { FindByPetIdRoute } from '../routes/FindByPetIdRoute';

export const findByPetId = (id: string) =>
  createRequest<ResponseMessage<FindByPetIdRoute['responses']>>(
    `/pets/${id}`,
    {}
  );
