import * as tscgen from 'tscgen';
import { getReference, register } from 'tscgen-framework';
import { getPaths } from '../../helpers/data';
import { writeParam } from '../../helpers/writeParam';
import { writeRequestBody } from '../../helpers/writeRequestBody';

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

  const requestBodyUnion = tscgen.unionType(
    ...requestBody.flatMap((body) => body.type)
  );

  const combinedType = (() => {
    if (queryParams && requestBodyUnion.definition.length) {
      return tscgen.objectType({
        query: queryParams,
        body: requestBodyUnion,
      });
    } else {
      return queryParams ?? requestBodyUnion;
    }
  })();

  return {
    imports: requestBody.flatMap((body) => body.imports),
    exports: {
      get route() {
        return tscgen
          .typeDefBuilder(params.route)
          .markExport()
          .addUnion(
            tscgen.objectType({
              method: tscgen.stringType(method),
              path: tscgen.stringType(data.route),
              params: pathParams ?? tscgen.undefinedType(),
              query: queryParams ?? tscgen.undefinedType(),
              requestBody: requestBodyUnion,
              combined: combinedType,
            })
          );
      },
    },
  };
});
