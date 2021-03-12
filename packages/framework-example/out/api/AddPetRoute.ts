import { createRequest } from '../request';
import { ResponseMessage } from '../ResponseMessage';
import { AddPetRoute } from '../routes/AddPetRoute';

export const addPet = (data: AddPetRoute['requestBody']) =>
  createRequest<ResponseMessage<AddPetRoute['responses']>>(`/pets`, {
    body: data,
  });
