import { createRequest } from '../request';
import { ResponseMessage } from '../ResponseMessage';
import { DeletePetRoute } from '../routes/DeletePetRoute';

export const deletePet = (id: string) =>
  createRequest<ResponseMessage<DeletePetRoute['responses']>>(
    `/pets/${id}`,
    {}
  );
