import * as tscgen from 'tscgen';
import { createInputsExport, createMappedExports } from 'tscgen-framework';
import { getSchemas } from '../../helpers/data';
import { writeSchema } from '../../helpers/writeSchema';

export const getPath = __filename;

export const getInputs = createInputsExport(() =>
  getSchemas().map((data) => ({
    data,
    params: {
      name: `I${data.name}Model`,
    },
  }))
);

export const getMappedExports = createMappedExports('routes')(
  getInputs,
  async ({ data, params, context }) => {
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
  }
);
