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
  Params extends string,
  DataShape = undefined
> = {
  routes: Routes;
  params: Params;
  getExports: DataShape extends undefined
    ? () => Promiseable<BuilderExports<Routes, true>>
    : GetMappedExports<GetInputs<DataShape, Params>, Routes>;
};

export interface IPreOutputType<
  Routes extends ReadonlyArray<string>,
  Params extends ReadonlyArray<string>,
  DataShape
> {
  routes: Routes;
  params: Params;
}

export interface IOutputsBuilder<
  Routes extends ReadonlyArray<string>,
  Params extends ReadonlyArray<string>,
  DataShape
> {
  addParams: <P extends ReadonlyArray<string>>(
    ...params: P
  ) => IOutputsBuilder<Routes, [...Params, ...P], DataShape>;
  setDataShape: <Shape>() => IOutputsBuilder<Routes, Params, Shape>;
  generateExports: (
    method: GetMappedExportsBase<GetInputs<DataShape, Params[number]>, Routes>
  ) => Promiseable<OutputType<Routes, Params[number], DataShape>>;
}

export function outputsBuilder<Routes extends ReadonlyArray<string>>(
  ...routes: Routes
) {
  function builder<
    Params extends ReadonlyArray<string> = ReadonlyArray<string>,
    DataShape = undefined
  >(defaultOptions: {
    params: Params;
  }): IOutputsBuilder<Routes, Params, DataShape> {
    return {
      addParams: (...params) => {
        return outputsBuilder({
          params,
        });
      },
      generateExports: (method) => ({
        inputs: undefined,
        routes,
        getExports: method,
      }),
    };
  }
  return builder();
}

outputsBuilder('123', '234').addParams('route').addParams('23oijf');
