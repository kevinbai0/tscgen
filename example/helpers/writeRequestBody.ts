import { OpenAPIV3 } from 'openapi-types';
import * as tscgen from '../../src/lib';
import { handleRef, SchemaHandlers, writeSchema } from './writeSchema';

export const writeRequestBody = (
  requestBody: OpenAPIV3.OperationObject['requestBody'],
  handlers: SchemaHandlers
) => {
  return handleRef(requestBody, {
    notRef: async (obj) => {
      const schemas = await tscgen.mapObjectPromise(
        obj?.content ?? {},
        (mediaObj) => {
          return writeSchema(mediaObj.schema!, handlers);
        }
      );

      return Object.keys(schemas).map((contentKey) => ({
        type: schemas[contentKey].type,
        imports: schemas[contentKey].imports,
      }));
    },
    ref: () => {
      throw new Error('References not handled for requestBody');
    },
  });
};
