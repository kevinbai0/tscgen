import {
  IBaseBuilder,
  IBaseBuilderTypes,
} from '../lib/core/builders/baseBuilder';

type Promiseable<T> = T | Promise<T>;
type Unpromise<T> = T extends Promise<infer U> ? U : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InputData<T = any> = {
  params: Record<string, string>;
  data: T;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GetInputs<T = any> = () => Promiseable<Array<InputData<T>>>;
export type GetMappedExports<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Inputs extends GetInputs<any>,
  Builders extends ReadonlyArray<IBaseBuilder<IBaseBuilderTypes, string>>,
  Unpromise = false
> = (
  inputs: TSCGenInputs<Inputs>
) => Unpromise extends true ? [...Builders] : Promiseable<[...Builders]>;
export type GetStaticExports<
  Builders extends ReadonlyArray<IBaseBuilder<IBaseBuilderTypes, string>>
> = () => Promiseable<Builders>;

export type TSCGenBuilders<
  T extends (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any
  ) => ReadonlyArray<IBaseBuilder<'type' | 'interface', string>>
> = ReturnType<T>;

export type TSCGenInputs<T extends GetInputs> = Unpromise<
  ReturnType<T>
>[number]['data'];

export type OutputModule<
  Inputs extends GetInputs = GetInputs,
  MappedBuilders extends ReadonlyArray<
    IBaseBuilder<'interface' | 'type', string>
  > = ReadonlyArray<IBaseBuilder<'interface' | 'type', string>>,
  StaticBuilders extends ReadonlyArray<
    IBaseBuilder<'interface' | 'type', string>
  > = ReadonlyArray<IBaseBuilder<'interface' | 'type', string>>,
  Unpromise extends boolean = false
> = {
  getStaticExports?: GetStaticExports<StaticBuilders>;
  getPath?: string;
  getMappedExports?: GetMappedExports<Inputs, MappedBuilders, Unpromise>;
  getInputs?: Inputs;
};
