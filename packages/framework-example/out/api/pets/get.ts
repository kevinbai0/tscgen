import { createRequest } from '../../request';
import { ResponseMessage } from '../../ResponseMessage';
import { FindPetsRoute } from '../../routes/FindPetsRoute';

export default (data: FindPetsRoute['query']) =>
  createRequest<ResponseMessage<FindPetsRoute['responses']>>(`/pets`, {
    query: data,
    method: `get`,
  });
