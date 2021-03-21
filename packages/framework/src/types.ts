import {
  IBaseBuilder,
  IEntityBuilder,
  IIdentifierType,
  IImportBuilder,
  IJsIdentifierValue,
  ILazyType,
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
/*
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
};*/

export const Errors = {
  IsRelativePathError: 'Path cannot be absolute',
  IsTypescriptError: 'Path must end in a .ts extension',
  IsStaticPathError: 'Not a static typescript file',
  IsMappedPathError: 'Not a mapped type',
  IsNonConflictingPathError: 'Path cannot be both static and mapped',
} as const;

export type Errors = typeof Errors;

type IsRelativePath<T extends string> = T extends `/${infer _}`
  ? Errors['IsRelativePathError']
  : true;
type IsTypescript<T extends string> = T extends `${infer _}.ts`
  ? true
  : Errors['IsTypescriptError'];
type IsMappedPath<T extends string> = Params<T> extends []
  ? Errors['IsMappedPathError']
  : true;
export type PathError<T extends string> = Exclude<
  IsTypescript<T> | IsRelativePath<T>,
  boolean
>;

export type Params<
  T extends string,
  P extends ReadonlyArray<string> = []
> = T extends `${infer _}[${infer Param}]${infer End}`
  ? Param extends ''
    ? Params<End, P>
    : Params<End, [...P, Param]>
  : P;

export type ParsedFilePath<T extends string> = {
  path: T;
  paramList: Params<T>;
};
export type FilePath<T extends string> = PathError<T> | ParsedFilePath<T>;

export type Output<T extends string> = PathError<T> | OutputBuilder<T>;

type OutputBuilder<
  T extends string,
  Exports extends Record<string, IEntityBuilder> = {},
  Data = unknown
> = IsMappedPath<T> extends true
  ? {
      setInputShape: <D>() => OutputBuilder<T, Exports, D>;
      generate: GenerateFunction<T, Data>;
    }
  : {
      generate: GenerateFunction<T, Data>;
      setSource: (
        source: `${string}.static.ts`
      ) => RegisteredModule<T, {}, undefined, true>;
    };

export type RegisteredModule<
  T extends string = `${string}.ts`,
  Exports extends Record<string, IEntityBuilder> = Record<
    string,
    IEntityBuilder
  >,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Data = any,
  IsStatic extends boolean = boolean
> = {
  isStatic: IsStatic;
  source: IsStatic extends true ? `${string}.static.ts` : undefined;
  data?: Data;
  pathData: FilePath<T>;
  getData: (
    inputs: InputData<Data, Record<string, string>>[],
    app: Application
  ) => Promise<
    {
      imports?: IBaseBuilder<'import'>[];
      exports: Exports;
      data: InputData<
        Data,
        Record<ParsedFilePath<T>['paramList'][number], string>
      >;
    }[]
  >;
};

type ApplicationPath<
  T extends Promise<Application>
> = Unpromise<T>['modules'][number]['pathData']['path'];

type FindModule<T extends Promise<Application>, Path extends string> = Extract<
  Unpromise<T>['modules'][number],
  { pathData: { path: Path } }
>;

type ModuleExportsType<Module extends RegisteredModule> = Unpromise<
  ReturnType<Module['getData']>
>[number]['exports'];

type ModuleInputData<Module extends RegisteredModule> = InputData<
  NonNullable<Module['data']>,
  Record<Module['pathData']['paramList'][number], string>
>;

export type GetCircularReference<CurrPath extends string> = <
  T extends Promise<Application>
>() => (
  module: keyof ModuleExportsType<FindModule<T, CurrPath>>,
  findOne: (val: ModuleInputData<FindModule<T, CurrPath>>) => boolean
) => Promise<ICircularReferenceResponse>;

export type GetStaticReference = <
  T extends RegisteredModule,
  S extends IJsIdentifierValue | IIdentifierType
>(
  regModule: T,
  module: string,
  identifier: S['type']
) => IStaticReferenceResponse<S>;

export type GetGlobalReference = <T extends RegisteredModule>(
  path: Promise<T>,
  routes: (keyof ModuleExportsType<T>)[],
  filterFn: (val: ModuleInputData<T>) => boolean
) => Promise<IGlobalReferenceResponse<T>>;

export type IGlobalReferenceResponse<T extends RegisteredModule> = {
  entities: IEntityBuilder[];
  imports: IImportBuilder[];
  inputData: ModuleInputData<T>[];
};

export type ICircularReferenceResponse = {
  identifier: ILazyType<IIdentifierType>;
  imports: IImportBuilder[];
};

export type IStaticReferenceResponse<
  Type extends IIdentifierType | IJsIdentifierValue = IIdentifierType
> = {
  identifier: Type;
  imports: IImportBuilder[];
};

type GenerateFunction<
  T extends string,
  Data = unknown
> = IsMappedPath<T> extends true
  ? <Exps extends Record<string, IEntityBuilder>>(
      callback: (options: {
        params: Record<ParsedFilePath<T>['paramList'][number], string>;
        data: Data;
        context: {
          getCircularReference: GetCircularReference<T>;
          getGlobalReference: GetGlobalReference;
          getStaticReference: GetStaticReference;
        };
      }) => Promiseable<{
        imports?: IBaseBuilder<'import'>[];
        exports: Exps;
      }>
    ) => Promise<RegisteredModule<T, Exps, Data, false>>
  : <Exps extends Record<string, IEntityBuilder>>(
      callback: (options: {
        context: {
          getGlobalReference: GetGlobalReference;
          getStaticReference: GetStaticReference;
        };
      }) => Promiseable<{
        imports?: IBaseBuilder<'import'>[];
        exports: Exps;
      }>
    ) => Promise<RegisteredModule<T, Exps, Data, false>>;

export type MappedOnly<T extends ReadonlyArray<RegisteredModule>> = {
  [Key in T[number]['pathData']['path']]: IsMappedPath<Key> extends true
    ? Extract<T[number], { pathData: { path: Key } }>
    : never;
}[T[number]['pathData']['path']];

export type Application<
  Modules extends ReadonlyArray<RegisteredModule> = ReadonlyArray<RegisteredModule>
> = {
  modules: Modules;
  data: {
    [Key in MappedOnly<Modules>['pathData']['path']]: InputData<
      NonNullable<
        Extract<Modules[number], { pathData: { path: Key } }>['data']
      >,
      Record<
        Extract<
          Modules[number],
          { pathData: { path: Key } }
        >['pathData']['paramList'][number],
        string
      >
    >[];
  };
};
