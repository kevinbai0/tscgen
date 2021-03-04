import { interfaceBuilder } from '../../generators/core/builders/interfaceBuilder';
import { stringType } from '../../generators/typescript/definitions';
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
    interfaceBuilder(data.name)
      .markExport()
      .addBody({
        name: stringType(data.name),
        route: stringType(data.route),
      }),
  ];
});

export const getPath = createPathExport(__dirname, '[name].out.ts');
