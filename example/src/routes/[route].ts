import * as tscgen from '../../../src/framework';
import { getPaths } from '../../helpers/data';
import { writeParam } from '../../helpers/writeParam';
import { writeRequestBody } from '../../helpers/writeRequestBody';

export const getPath = __filename;

const capFirst = (val: string) => {
  return val.slice(0, 1).toUpperCase() + val.slice(1);
};

export const getInputs = tscgen.createInputsExport(() => {
  const data = getPaths();

  return data.map((info) => ({
    params: {
      route: `${capFirst(info.pathInfo.operationId!)}Route`,
    },
    data: info,
  }));
});

export const getMappedExports = tscgen.createMappedExports('route')(
  getInputs,
  async ({ data, params }) => {
    const method = data.pathInfo.method;

    const pathParams = writeParam(
      data.pathInfo.parameters,
      (val) => val.in === 'path'
    );
    const queryParams = writeParam(
      data.pathInfo.parameters,
      (val) => val.in === 'query'
    );

    const modelsRef = await tscgen.getReference(
      import('../models/[name]'),
      getPath
    );

    const requestBody = await writeRequestBody(data.pathInfo.requestBody, {
      resolveReference: async (ref) => {
        const res = await modelsRef
          .referenceMappedExports('routes')
          .filter((data) => data.data.name === ref);
        return {
          typeIdentifier: tscgen.identifierType(res.exports[0]),
          importValue: res.imports[0],
        };
      },
    });

    const requestBodyUnion = tscgen.unionType(
      requestBody.flatMap((body) => body.type)
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
            .setKey('IRoute')
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
  }
);
