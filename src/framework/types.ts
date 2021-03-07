import { IIdentifierType, IImportBuilder, ILazyType } from '../lib';
import {
  IBaseBuilder,
  IEntityBuilder,
} from '../lib/core/builders/entityBuilder';
import { Promiseable, Unpromise } from '../lib/helpers/promise';

export type InputData<
  T = unknown,
  Params extends Record<string, string> = Record<string, string>
> = {
  params: Params;
  data: T;
};

export type BuilderExports<Exports extends [...IEntityBuilder[]]> = {
  imports?: ReadonlyArray<IBaseBuilder<'import'>>;
  exports: Exports;
};

export type Context<
  Inputs extends GetInputs = GetInputs,
  Builders extends ReadonlyArray<IEntityBuilder> = ReadonlyArray<IEntityBuilder>
> = {
  referenceIdentifier<K extends Builders[number]>(data: {
    findOne: (inputs: TSCGenInputs<Inputs>) => unknown;
    pick: (value: Builders) => K;
  }): {
    importValue: IImportBuilder;
    typeIdentifier: ILazyType<IIdentifierType<Builders[number]>>;
  };
};

export type GetInputs<
  T = unknown,
  Params extends Record<string, string> = Record<string, string>
> = () => Promiseable<Array<InputData<T, Params>>>;
export type GetMappedExports<
  Inputs extends GetInputs = GetInputs,
  Exports extends [...IEntityBuilder[]] = [...IEntityBuilder[]],
  Builders extends BuilderExports<Exports> = BuilderExports<Exports>,
  Unpromise = false
> = (
  options: {
    context: Context<Inputs, Builders['exports']>;
  } & TSCGenInputs<Inputs>
) => Unpromise extends true ? Builders : Promiseable<Builders>;

export type GetStaticExports<
  Exports extends [...IEntityBuilder[]],
  Builders extends BuilderExports<Exports>
> = () => Promiseable<Builders>;

export type TSCGenBuilders<T extends GetMappedExports> = Unpromise<
  ReturnType<T>
>;

export type TSCGenInputs<T extends GetInputs> = Unpromise<
  ReturnType<T>
>[number];

export type OutputModule<
  Inputs extends GetInputs = GetInputs,
  MappedExports extends [...IEntityBuilder[]] = [...IEntityBuilder[]],
  StaticExports extends [...IEntityBuilder[]] = [...IEntityBuilder[]],
  MappedBuilders extends BuilderExports<MappedExports> = BuilderExports<MappedExports>,
  StaticBuilders extends BuilderExports<StaticExports> = BuilderExports<StaticExports>,
  Unpromise extends boolean = false
> = {
  getStaticExports?: GetStaticExports<StaticExports, StaticBuilders>;
  getPath: string;
  getMappedExports?: GetMappedExports<
    Inputs,
    MappedExports,
    MappedBuilders,
    Unpromise
  >;
  getInputs?: Inputs;
};
