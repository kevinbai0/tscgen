import { OpenAPIV3 } from 'openapi-types';
import * as tscgen from 'tscgen';
import { handleRef } from './writeSchema';

export const writeParam = (
  params: OpenAPIV3.OperationObject['parameters'],
  filter?: (val: OpenAPIV3.ParameterObject) => boolean
) => {
  const filteredParams = filter
    ? params?.filter((val) =>
        handleRef(val, {
          ref: () => true,
          notRef: filter,
        })
      )
    : params;

  if (!filteredParams?.length) {
    return undefined;
  }

  return tscgen.toObjectType(filteredParams, (param) => {
    return handleRef(param, {
      ref: () => {
        throw new Error('no params handled');
      },
      notRef: (obj) => {
        return {
          key: obj.name,
          value: [tscgen.stringType(), !!obj.required],
        };
      },
    });
  });
};
