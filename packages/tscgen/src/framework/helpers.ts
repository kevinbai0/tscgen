import {
  IBaseBuilder,
  IEntityBuilder,
} from '../lib/core/builders/entityBuilder';
import {
  BuilderExports,
  GetInputs,
  GetMappedExports,
  GetMappedExportsBase,
} from './types';

export const createInputsExport = <T, Params extends Record<string, string>>(
  method: GetInputs<T, Params>
): GetInputs<T, Params> => method;

export const createMappedExports = <Order extends ReadonlyArray<string>>(
  ...order: Order
) => <Inputs extends GetInputs>(
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _getInputs: Inputs,
  getMappedExports: GetMappedExportsBase<Inputs, Order>
): GetMappedExports<Inputs, Order> => {
  return async (data) => {
    const res = await getMappedExports(data);
    return {
      imports: res.imports,
      exports: {
        values: res.exports,
        order,
      },
    };
  };
};

export const createPathExport = (...path: [dir: string, filename: string]) =>
  path;
export const createStaticExports = <Exports extends ReadonlyArray<string>>(
  ...order: Exports
) => (
  getBuilders: () => Promise<{
    imports: ReadonlyArray<IBaseBuilder<'import'>>;
    exports: Record<Exports[number], IEntityBuilder>;
  }>
) => async (): Promise<BuilderExports<Exports>> => {
  const res = await getBuilders();

  return {
    imports: res.imports,
    exports: {
      order,
      values: res.exports,
    },
  };
};

export function createExports<T extends ReadonlyArray<IEntityBuilder>>(
  imports: IBaseBuilder<'import'>[],
  ...exports: T
): {
  exports: T;
  imports: IBaseBuilder<'import'>[];
} {
  return {
    exports,
    imports,
  };
}

export type BuilderFromKeys<T> = {
  [Key in keyof T]: T[Key] extends string ? IEntityBuilder : never;
};
