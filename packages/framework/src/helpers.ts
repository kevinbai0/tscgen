/*import { GetInputs, GetMappedExports, GetMappedExportsBase } from './types';

export const createInputs = <T, Params extends Record<string, string>>(
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
*/
