import { OpenAPIV3 } from 'openapi-types';
import { mapObjectPromise, undefinedType } from 'tscgen';
import {
  handleRef,
  IWriteSchemaTypeHandlers,
  SchemaHandlers,
  writeSchema,
} from './writeSchema';

export const writeResponseBody = (
  responses: OpenAPIV3.OperationObject['responses'],
  handlers: SchemaHandlers & Partial<IWriteSchemaTypeHandlers>
) => {
  const res = Object.entries(responses ?? {}).map(([key, body]) => {
    return handleRef(body, {
      notRef: async (obj) => {
        const schemas = await mapObjectPromise(obj?.content ?? {}, (mediaObj) =>
          writeSchema(mediaObj.schema!, handlers)
        );

        if (!obj.content) {
          return {
            status: key,
            type: undefinedType(),
            imports: [],
          };
        }

        return Object.keys(schemas).map((contentKey) => ({
          status: key,
          type: schemas[contentKey].type,
          imports: schemas[contentKey].imports,
        }))[0];
      },
      ref: () => {
        throw new Error('References not handled for requestBody');
      },
    });
  });
  return Promise.all(res);
};
