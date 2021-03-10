import { Promiseable } from 'tscgen';
import { createMappedExports } from './helpers';
import {
  BuilderExports,
  GetInputs,
  GetMappedExports,
  GetMappedExportsBase,
} from './types';

export type OutputType<
  Routes extends ReadonlyArray<string>,
  Inputs extends GetInputs | undefined
> = {
  routes: Routes;
  inputs: Inputs;
  getExports: Inputs extends GetInputs
    ? GetMappedExports<Inputs, Routes>
    : () => Promiseable<BuilderExports<Routes, true>>;
};

export type WithInputsReturn<
  Routes extends ReadonlyArray<string>,
  Inputs extends GetInputs
> = {
  generateExports: (
    method: GetMappedExportsBase<Inputs, Routes>
  ) => Promiseable<OutputType<Routes, Inputs>>;
};

type RegisterReturn<Routes extends ReadonlyArray<string>> = {
  withInputs: <T, Params extends Record<string, string>>(
    inputs: GetInputs<T, Params>
  ) => WithInputsReturn<Routes, GetInputs<T, Params>>;
  generateExports: (
    method: () => Promiseable<BuilderExports<Routes, true>>
  ) => Promiseable<OutputType<Routes, undefined>>;
};

export function register<Routes extends ReadonlyArray<string>>(
  ...routes: Routes
): RegisterReturn<Routes> {
  return {
    withInputs: (inputs) => ({
      generateExports: async (method) =>
        ({
          inputs,
          routes,
          getExports: createMappedExports<Routes>(...routes)(inputs, method),
        } as OutputType<Routes, typeof inputs>),
    }),
    generateExports: (method) => ({
      inputs: undefined,
      routes,
      getExports: method,
    }),
  };
}
