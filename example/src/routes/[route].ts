import * as tscgen from '../../../src/framework';
import { getPaths } from '../data.helper';
import { writeParam } from '../writeParam.helper';
import { writeRequestBody } from '../writeRequestBody.helper';

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

export const getMappedExports = tscgen.createMappedExports(
  getInputs,
  async ({ data, params, context }) => {
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
        const res = await modelsRef.referenceMappedExports({
          filter: (data) => data.data.name === ref,
          pick: ([builder]) => builder,
        });
        return {
          typeIdentifier: tscgen.identifierType(res.exports[0]),
          importValue: res.imports[0],
        };
      },
    });

    return {
      imports: requestBody.flatMap((body) => body.imports),
      exports: [
        tscgen
          .interfaceBuilder(params.route)
          .markExport()
          .addBody({
            method: tscgen.stringType(method),
            path: tscgen.stringType(data.route),
            params: pathParams ?? tscgen.undefinedType(),
            query: queryParams ?? tscgen.undefinedType(),
            requestBody: tscgen.unionType(
              requestBody.flatMap((body) => body.type)
            ),
          }),
      ],
    };
  }
);
