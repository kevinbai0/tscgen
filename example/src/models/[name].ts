import * as tscgen from '../../../src/framework';
import { data } from '../data.helper';

export const getInputs = tscgen.createInputsExport(() =>
  data.map((data) => ({
    data,
    params: {
      name: data.name,
    },
  }))
);

export const getMappedExports = tscgen.createMappedExports(
  getInputs,
  (data) => {
    return [
      tscgen
        .interfaceBuilder(data.name)
        .markExport()
        .addBody({
          name: tscgen.stringType(data.name),
          route: tscgen.stringType(data.route),
        }),
    ];
  }
);

export const getPath = __filename;
