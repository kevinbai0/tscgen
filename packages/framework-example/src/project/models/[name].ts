import * as tscgen from 'tscgen';
import { register } from 'tscgen-framework';
import { getSchemas } from '../../helpers/data';
import { writeSchema } from '../../helpers/writeSchema';

export const getPath = __filename;

const outputs = register('routes').withInputs(() =>
  getSchemas().map((data) => ({
    data,
    params: {
      name: `I${data.name}Model`,
    },
  }))
);

export default outputs.generateExports(async ({ data, params, context }) => {
  const body = await writeSchema(data.schema, {
    resolveReference: (importName) => {
      return context
        .referenceIdentifier('routes')
        .findOne((value) => value.data.name === importName);
    },
  });

  return {
    imports: body.imports,
    exports: {
      get routes() {
        return tscgen
          .typeDefBuilder(params.name)
          .markExport()
          .addUnion(body.type);
      },
    },
  };
});
