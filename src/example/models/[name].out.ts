import * as tscgen from '../../index';
import {
  createMappedExports,
  createInputsExport,
  createPathExport,
} from '../../project/getReference';
import { data } from '../index.data';

export const getInputs = createInputsExport(() =>
  data.map((data) => ({
    data,
    params: {
      name: data.name,
    },
  }))
);

export const getMappedExports = createMappedExports(getInputs, (data) => {
  return [
    tscgen
      .interfaceBuilder(data.name)
      .markExport()
      .addBody({
        name: tscgen.stringType(data.name),
        route: tscgen.stringType(data.route),
      }),
  ];
});

export const getPath = createPathExport(__dirname, '[name].out.ts');
