import {
  identifierType,
  interfaceBuilder,
  numberType,
  objectType,
  stringType,
  undefinedType,
  unionType,
} from 'tscgen';
import { register } from 'tscgen-framework';
import { IPath } from '../schema/data';
import { writeParam } from '../schema/writeParam';
import { writeRequestBody } from '../schema/writeRequestBody';
import { writeResponseBody } from '../schema/writeResponseBody';
import { models } from './models';

export const routes = register('routes/[route].ts')
  .setInputShape<IPath>()
  .generate(async ({ data, params, context }) => {
    const method = data.pathInfo.method;

    const pathParams = writeParam(
      data.pathInfo.parameters,
      (val) => val.in === 'path'
    );
    const queryParams = writeParam(
      data.pathInfo.parameters,
      (val) => val.in === 'query'
    );

    const requestBody = await writeRequestBody(data.pathInfo.requestBody, {
      handleReference: async (ref, handler) => {
        const res = await context.getGlobalReference(
          models,
          ['model'],
          (data) => data.data.name === ref
        );
        handler.setType(identifierType(res.entities[0]));
        handler.addImport(res.imports);
      },
    });

    const requestBodyUnion = requestBody.length
      ? unionType(...requestBody.flatMap((body) => body.type))
      : undefinedType();

    const responses = await writeResponseBody(data.pathInfo.responses, {
      handleReference: async (ref, handler) => {
        const res = await context.getGlobalReference(
          models,
          ['model'],
          (data) => data.data.name === ref
        );
        handler.addImport(res.imports);
        handler.setType(identifierType(res.entities[0]));
      },
    });

    return {
      imports: requestBody
        .flatMap((body) => body.imports)
        .concat(responses.flatMap((val) => val.imports)),
      exports: {
        get route() {
          return interfaceBuilder(params.route)
            .markExport()
            .addBody({
              method: stringType(method),
              path: stringType(data.route),
              params: pathParams ?? undefinedType(),
              query: queryParams ?? undefinedType(),
              requestBody: requestBodyUnion,
              responses: unionType(
                ...responses.map((response) =>
                  objectType({
                    status:
                      response.status === 'default'
                        ? numberType()
                        : numberType(Number(response.status)),
                    data: response.type,
                  })
                )
              ),
            });
        },
      },
    };
  });
