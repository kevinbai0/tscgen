import {
  IBaseBuilder,
  IBaseBuilderTypes,
} from '../lib/core/builders/baseBuilder';
import { GetInputs, GetMappedExports, GetStaticExports } from './types';

export const createInputsExport = <T>(method: GetInputs<T>): GetInputs<T> =>
  method;

export const createMappedExports = <
  Inputs extends GetInputs,
  Builders extends ReadonlyArray<IBaseBuilder<IBaseBuilderTypes, string>>
>(
  _inputs: Inputs,
  getBuilders: GetMappedExports<Inputs, Builders>
): GetMappedExports<Inputs, Builders> => {
  return getBuilders;
};
export const createPathExport = (...path: [dir: string, filename: string]) =>
  path;
export const createStaticExports = <
  Builders extends ReadonlyArray<IBaseBuilder<IBaseBuilderTypes, string>>
>(
  getBuilders: () => Promise<[...Builders]>
): GetStaticExports<Builders> => {
  return getBuilders;
};
