import fs from 'fs';
import path from 'path';
import {
  combine,
  IBaseBuilder,
  IEntityBuilder,
  interfaceBuilder,
  numberTuple,
  stringType,
} from 'tscgen';
import { InputData } from 'tscgen-framework';

const Errors = {
  IsRelativePathError: 'Path cannot be absolute',
  IsTypescriptError: 'Path must end in a .ts extension',
  IsStaticPathError: 'Not a static typescript file',
  IsMappedPathError: 'Not a mapped type',
  IsNonConflictingPathError: 'Path cannot be both static and mapped',
} as const;

type Errors = typeof Errors;

type IsRelativePath<T extends string> = T extends `/${infer _}`
  ? Errors['IsRelativePathError']
  : true;
type IsTypescript<T extends string> = T extends `${infer _}.ts`
  ? true
  : Errors['IsTypescriptError'];
type IsMappedPath<T extends string> = Params<T> extends []
  ? Errors['IsMappedPathError']
  : true;
type PathError<T extends string> = Exclude<
  IsTypescript<T> | IsRelativePath<T>,
  boolean
>;

type Params<
  T extends string,
  P extends ReadonlyArray<string> = []
> = T extends `${infer _}[${infer Param}]${infer End}`
  ? Param extends ''
    ? Params<End, P>
    : Params<End, [...P, Param]>
  : P;

type ParsedFilePath<T extends string> = {
  path: T;
  paramList: Params<T>;
};
type FilePath<T extends string> = PathError<T> | ParsedFilePath<T>;

function pathParams(path: string) {
  const params: ReadonlyArray<string> =
    path.match(/\[[^\]]*\]/g)?.map((val) => val.replace(/[[\]]/g, '')) ?? [];

  return params;
}

export function registerPath<T extends string>(path: T): FilePath<T> {
  if (path.startsWith('/')) {
    return Errors.IsRelativePathError as FilePath<T>;
  }

  if (!path.endsWith('.ts')) {
    return Errors.IsTypescriptError as FilePath<T>;
  }

  const params = pathParams(path);
  const isMapped = !!params.length;

  if (isStaticPath(path) && isMapped) {
    return Errors.IsNonConflictingPathError as FilePath<T>;
  }

  const parsed: ParsedFilePath<T> = {
    path,
    paramList: params,
  };

  return parsed as FilePath<T>;
}

function isFilePathError<T extends string>(
  fp: FilePath<T>
): fp is PathError<T> {
  if (typeof fp === 'string') {
    return true;
  }
  return false;
}

function isStaticPath(value: string): value is `${string}.static.ts` {
  if (value.endsWith('.static.ts')) {
    return true;
  }
  return false;
}

export function register<T extends string>(path: T): Output<T> {
  const res = registerPath(path);
  if (isFilePathError(res)) {
    return res;
  }

  const params = pathParams(path);

  if (params.length) {
    const output: Output<`[param].ts`> = {
      setInputShape() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this as any;
      },
      generate: (callback) => {
        return {
          getData: (inputs) => {
            return inputs.map((val) => {
              return {
                ...callback(val),
                data: val,
              };
            });
          },
          source: undefined,
          isStatic: false,
          pathData: {
            path: path as '[param].ts',
            paramList: params as ['param'],
          },
        };
      },
    };

    return (output as unknown) as Output<T>;
  }

  const output: Output<`${string}.ts`> = {
    setSource: (sourceData) => {
      return {
        isStatic: true,
        source: sourceData,
        pathData: {
          path: res.path as `${string}.ts`,
          paramList: [],
        },
        getData: () => [
          {
            exports: {},
            imports: [],
            data: {
              data: undefined,
              params: {},
            },
          },
        ],
      };
    },
    generate: (callback) => {
      return {
        getData: () => [
          { ...callback(), data: { data: undefined, params: {} } },
        ],
        isStatic: false,
        source: undefined,
        pathData: {
          path: path as 'non-mapped.ts',
          paramList: [],
        },
      };
    },
  };
  return output as Output<T>;
}

type Output<T extends string> = PathError<T> | OutputBuilder<T>;

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

type RegisteredModule<
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
    inputs: InputData<Data, Record<string, string>>[]
  ) => {
    imports?: IBaseBuilder<'import'>[];
    exports: Exports;
    data: InputData<
      Data,
      Record<ParsedFilePath<T>['paramList'][number], string>
    >;
  }[];
};

type GenerateFunction<
  T extends string,
  Data = unknown
> = IsMappedPath<T> extends true
  ? <Exps extends Record<string, IEntityBuilder>>(
      callback: (options: {
        params: Record<ParsedFilePath<T>['paramList'][number], string>;
        data: Data;
      }) => {
        imports?: IBaseBuilder<'import'>[];
        exports: Exps;
      }
    ) => RegisteredModule<T, Exps, Data, false>
  : <Exps extends Record<string, IEntityBuilder>>(
      callback: () => {
        imports?: IBaseBuilder<'import'>[];
        exports: Exps;
      }
    ) => RegisteredModule<T, Exps, Data, false>;

const models = register('models/[name].ts')
  .setInputShape<string>()
  .generate(({ params, data }) => {
    return {
      exports: {
        Data: interfaceBuilder(data).addBody({
          name: stringType(params.name),
          value: numberTuple(0, 2, 4, 6, 8, 10),
        }),
      },
    };
  });

const staticModule = register('models.ts').generate(() => {
  return {
    exports: {},
  };
});

const accStatic = register('models.ts').setSource('request.static.ts');

const routes = register('api/[path]/[method].ts')
  .setInputShape<string>()
  .generate(({ params, data }) => {
    return {
      exports: {
        Data: interfaceBuilder(data).addBody({
          name: stringType(params.method),
          value: numberTuple(0, 2, 4, 6, 8, 10),
        }),
      },
    };
  });

type Application<Modules extends ReadonlyArray<RegisteredModule>> = {
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

type MappedOnly<T extends ReadonlyArray<RegisteredModule>> = {
  [Key in T[number]['pathData']['path']]: IsMappedPath<Key> extends true
    ? Extract<T[number], { pathData: { path: Key } }>
    : never;
}[T[number]['pathData']['path']];

function registerAll<T extends ReadonlyArray<RegisteredModule>>(
  ...modules: T
): {
  setInputs: (values: Application<T>['data']) => Application<T>;
} {
  return {
    setInputs: (data) => {
      return {
        modules,
        data,
      };
    },
  };
}

const app = registerAll(models, routes, staticModule, accStatic).setInputs({
  'models/[name].ts': [
    {
      data: 'sdf',
      params: {
        name: 'Hello',
      },
    },
  ],
  'api/[path]/[method].ts': [],
});

async function writeApplication(
  app: Application<ReadonlyArray<RegisteredModule>>
) {
  const getOutDir = (dir: string) => path.join('out', dir);

  app.modules.map((module) => {
    if (module.isStatic) {
      const source = fs.readFileSync(module.source!, 'utf-8');

      fs.writeFileSync(getOutDir(module.pathData.path), source);
    }
    const data = app.data as Record<string, InputData[]>;
    if (data[module.pathData.path]) {
      const res = module.getData(data[module.pathData.path]);

      res.forEach((val) => {
        const newFilePath = module.pathData.paramList.reduce(
          (acc, param) => acc.replace(`[${param}]`, val.data.params[param]),
          module.pathData.path as string
        );

        fs.writeFileSync(
          getOutDir(newFilePath),
          combine(...[...(val.imports ?? []), ...Object.values(val.exports)])
        );
      });
    }
  });
}

writeApplication(app).catch(console.error);
