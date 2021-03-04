import { interfaceBuilder } from '../../builders/interfaceBuilder';
import { stringType } from '../../definition/typeDefinitions';
import { data } from '../index.data';

export const tscgen = (data: { name: string; route: string }) => {
  return [
    interfaceBuilder(data.name)
      .markExport()
      .addBody({
        name: stringType(data.name),
        route: stringType(data.route),
      }),
  ] as const;
};

export const inputs = data.map((data) => ({
  data,
  params: {
    name: data.name,
  },
}));
