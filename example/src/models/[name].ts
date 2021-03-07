import * as tscgen from '../../../src/framework';
import { getSchemas } from '../data.helper';
import { writeSchema } from '../writeSchema.helper';

export const getInputs = tscgen.createInputsExport(() =>
  getSchemas().map((data) => ({
    data,
    params: {
      name: `I${data.name}Model`,
    },
  }))
);

export const getMappedExports = tscgen.createMappedExports(
  getInputs,
  async ({ data, params, context }) => {
    const body = await writeSchema(data.schema, {
      resolveReference: (importName) => {
        return context.referenceIdentifier({
          findOne: (value) => value.data.name === importName,
          pick: ([builder]) => builder,
        });
      },
    });

    return {
      imports: body.imports,
      exports: [
        tscgen.typeDefBuilder(params.name).markExport().addUnion(body.type),
      ],
    };
  }
);

export const getPath = __filename;
