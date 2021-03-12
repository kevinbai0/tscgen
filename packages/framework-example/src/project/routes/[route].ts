import * as tscgen from 'tscgen';
import { getReference, register } from 'tscgen-framework';
import { getPaths } from '../../helpers/data';
import { writeParam } from '../../helpers/writeParam';
import { writeRequestBody } from '../../helpers/writeRequestBody';
import { writeResponseBody } from '../../helpers/writeResponseBody';

export const getPath = __filename;

const capFirst = (val: string) => {
  return val.slice(0, 1).toUpperCase() + val.slice(1);
};

const outputs = register('route').withInputs(() => {
  const data = getPaths();

  return data.map((info) => ({
    params: {
      route: `${capFirst(info.pathInfo.operationId!)}Route`,
    },
    data: info,
  }));
});

export default outputs.generateExports(async ({ data, params }) => {
  const method = data.pathInfo.method;

  const pathParams = writeParam(
    data.pathInfo.parameters,
    (val) => val.in === 'path'
  );
  const queryParams = writeParam(
    data.pathInfo.parameters,
    (val) => val.in === 'query'
  );

  const modelsRef = await getReference(import('../models/[name]'), getPath);

  const requestBody = await writeRequestBody(data.pathInfo.requestBody, {
    resolveReference: async (ref) => {
      const res = await modelsRef
        .referenceExports('routes')
        .filter((data) => data.data.name === ref);
      return {
        typeIdentifier: tscgen.identifierType(res.exports[0]),
        importValue: res.imports[0],
      };
    },
  });

  const requestBodyUnion = requestBody.length
    ? tscgen.unionType(...requestBody.flatMap((body) => body.type))
    : tscgen.undefinedType();

  const responses = await writeResponseBody(data.pathInfo.responses, {
    resolveReference: async (ref) => {
      const values = await modelsRef
        .referenceExports('routes')
        .filter((input) => input.data.name === ref);

      return {
        importValue: values.imports[0],
        typeIdentifier: tscgen.identifierType(values.exports[0]),
      };
    },
  });

  return {
    imports: requestBody
      .flatMap((body) => body.imports)
      .concat(responses.flatMap((val) => val.imports)),
    exports: {
      get route() {
        return tscgen
          .interfaceBuilder(params.route)
          .markExport()
          .addBody({
            method: tscgen.stringType(method),
            path: tscgen.stringType(data.route),
            params: pathParams ?? tscgen.undefinedType(),
            query: queryParams ?? tscgen.undefinedType(),
            requestBody: requestBodyUnion,
            responses: tscgen.unionType(
              ...responses.map((response) =>
                tscgen.objectType({
                  status:
                    response.status === 'default'
                      ? tscgen.numberType()
                      : tscgen.numberType(Number(response.status)),
                  data: response.type,
                })
              )
            ),
          });
      },
    },
  };
});
