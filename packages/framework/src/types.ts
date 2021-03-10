import {
  IIdentifierType,
  IImportBuilder,
  ILazyType,
  IBaseBuilder,
  IEntityBuilder,
  Promiseable,
  Unpromise,
} from 'tscgen';

export type InputData<
  T = unknown,
  Params extends Record<string, string> = Record<string, string>
> = {
  params: Params;
  data: T;
};

export type ExportData<Exports extends ReadonlyArray<string>> = {
  values: {
    [Key in Exports[number]]: IEntityBuilder;
  };
  order: Exports;
};

export type BuilderExports<
  Exports extends ReadonlyArray<string>,
  OmitOrder extends boolean = false
> = {
  imports?: ReadonlyArray<IBaseBuilder<'import'>>;
  exports: OmitOrder extends true
    ? ExportData<Exports>['values']
    : ExportData<Exports>;
};

export type Context<
  Inputs extends GetInputs,
  Order extends ReadonlyArray<string>
> = {
  referenceIdentifier<K extends Order[number]>(
    pick: K
  ): {
    findOne: (
      data: (inputs: TSCGenInputs<Inputs>) => unknown
    ) => {
      importValue: IImportBuilder;
      typeIdentifier: ILazyType<IIdentifierType>;
    };
  };
};

export type GetInputs<
  T = unknown,
  Params extends Record<string, string> = Record<string, string>
> = () => Promiseable<Array<InputData<T, Params>>>;

export type GetMappedExportsBase<
  Inputs extends GetInputs,
  Keys extends ReadonlyArray<string>,
  Unpromise extends boolean = false
> = (
  options: TSCGenInputs<Inputs> & {
    context: Context<Inputs, Keys>;
  }
) => Unpromise extends true
  ? BuilderExports<Keys, true>
  : Promiseable<BuilderExports<Keys, true>>;

export type GetMappedExports<
  Inputs extends GetInputs,
  Keys extends ReadonlyArray<string>,
  Unpromise extends boolean = false
> = (
  options: TSCGenInputs<Inputs> & {
    context: Context<Inputs, Keys>;
  }
) => Unpromise extends true
  ? BuilderExports<Keys>
  : Promiseable<BuilderExports<Keys>>;

export type GetStaticExports<
  Exports extends ReadonlyArray<string>,
  Builders extends BuilderExports<Exports>
> = () => Promiseable<Builders>;

export type TSCGenBuilders<
  T extends GetMappedExports<GetInputs, ReadonlyArray<string>>
> = Unpromise<ReturnType<T>>;

export type TSCGenInputs<T extends GetInputs> = Unpromise<
  ReturnType<T>
>[number];

export type OutputModule<
  Inputs extends GetInputs = GetInputs,
  MappedExports extends ReadonlyArray<string> = ReadonlyArray<string>,
  StaticExports extends ReadonlyArray<string> = ReadonlyArray<string>,
  StaticBuilders extends BuilderExports<StaticExports> = BuilderExports<StaticExports>,
  Unpromise extends boolean = false
> = {
  getStaticExports?: GetStaticExports<StaticExports, StaticBuilders>;
  getPath: string;
  getMappedExports?: GetMappedExports<Inputs, MappedExports, Unpromise>;
  getInputs?: Inputs;
};
