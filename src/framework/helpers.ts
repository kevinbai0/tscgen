import { IEntityBuilder } from '../lib/core/builders/entityBuilder';
import { BuilderExports, GetInputs, GetMappedExports } from './types';

export const createInputsExport = <T, Params extends Record<string, string>>(
  method: GetInputs<T, Params>
): GetInputs<T, Params> => method;

export const createMappedExports = <
  Inputs extends GetInputs,
  Exports extends [...IEntityBuilder[]],
  Builders extends BuilderExports<Exports>
>(
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _inputs: Inputs,
  getBuilders: GetMappedExports<Inputs, Exports, Builders>
) => getBuilders;

export const createPathExport = (...path: [dir: string, filename: string]) =>
  path;
export const createStaticExports = <
  Exports extends [...IEntityBuilder[]],
  Builders extends BuilderExports<Exports>
>(
  getBuilders: () => Promise<Builders>
) => getBuilders;
