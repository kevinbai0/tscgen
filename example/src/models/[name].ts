import * as tscgen from '../../../src/framework';
import { getSchemas } from '../data.helper';

export const getInputs = tscgen.createInputsExport(() =>
  getSchemas().map((data) => ({
    data,
    params: {
      name: data.name,
    },
  }))
);

export const getMappedExports = tscgen.createMappedExports(
  getInputs,
  ({ data, context }) => {
    const modelName = `I${data.name}Model`;

    const ref =
      data.name === 'Pet'
        ? context.referenceIdentifier({
            findOne: ({ params }) => params.name === 'NewPet',
            pick: (builders) => builders[0],
          })
        : undefined;

    return {
      imports: ref?.importValue ? [ref.importValue] : [],
      exports: [
        tscgen
          .interfaceBuilder(modelName)
          .markExport()
          .addBody({
            name: tscgen.stringType(data.name),
            ...(ref?.typeIdentifier ? { reference: ref.typeIdentifier } : {}),
          }),
      ],
    };
  }
);

export const getPath = __filename;
