import {
  identifierType,
  identifierValue,
  IEntityBuilder,
  importBuilder,
  importModuleType,
  interfaceBuilder,
  lazyImportType,
  lazyType,
  variableBuilder,
} from 'tscgen';
import { getFilename } from './getFilename';
import {
  Errors,
  FilePath,
  InputData,
  IStaticReferenceResponse,
  Output,
  Params,
  ParsedFilePath,
  PathError,
  Application,
  GetStaticReference,
  GetGlobalReference,
  GetCircularReference,
} from './types';

export function register<T extends string>(modulePath: T): Output<T> {
  const res = registerPath(modulePath);
  if (isFilePathError(res)) {
    return res;
  }

  const params = pathParams(modulePath);

  if (params.length) {
    const output: Output<`[param].ts`> = {
      setInputShape() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this as any;
      },
      generate: async (callback) => {
        return {
          getData: async (inputs, app) => {
            const savedState: (
              | undefined
              | Record<string, IEntityBuilder>
            )[] = inputs.map(() => undefined);

            return Promise.all(
              inputs.map(async (val, index) => {
                const res = {
                  ...(await Promise.resolve(
                    callback({
                      ...val,
                      context: {
                        getStaticReference: createGetStaticReference({
                          modulePath,
                          inputData: val,
                        }),
                        getCircularReference: createGetCircularReference({
                          inputData: val,
                          inputs: inputs,
                          savedState,
                          modulePath,
                        }),
                        getGlobalReference: createGetGlobalReference({
                          modulePath,
                          app,
                          inputData: val,
                        }),
                      },
                    })
                  )),
                  data: val,
                };

                // eslint-disable-next-line require-atomic-updates
                savedState[index] = res.exports;

                return res;
              })
            );
          },
          source: undefined,
          isStatic: false,
          pathData: {
            path: modulePath as '[param].ts',
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
        getData: async () => [
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
    generate: async (callback) => {
      return {
        getData: async (_, app) => [
          {
            ...(await Promise.resolve(
              callback({
                context: {
                  getGlobalReference: createGetGlobalReference({
                    modulePath,
                    app,
                    inputData: { data: {}, params: {} },
                  }),
                  getStaticReference: createGetStaticReference({
                    modulePath,
                    inputData: { data: {}, params: {} },
                  }),
                },
              })
            )),
            data: { data: undefined, params: {} },
          },
        ],
        isStatic: false,
        source: undefined,
        pathData: {
          path: modulePath as 'non-mapped.ts',
          paramList: [],
        },
      };
    },
  };
  return output as Output<T>;
}

function pathParams(path: string) {
  const params: ReadonlyArray<string> =
    path.match(/\[[^\]]*\]/g)?.map((val) => val.replace(/[[\]]/g, '')) ?? [];

  return params;
}

function registerPath<T extends string>(path: T): FilePath<T> {
  if (path.startsWith('/')) {
    return Errors.IsRelativePathError as FilePath<T>;
  }

  if (!path.endsWith('.ts')) {
    return Errors.IsTypescriptError as FilePath<T>;
  }

  const params = pathParams(path);

  const parsed: ParsedFilePath<T> = {
    path,
    paramList: params as Params<T, []>,
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

function createGetStaticReference<Path extends string>({
  modulePath,
  inputData,
}: {
  modulePath: Path;
  inputData: InputData;
}): GetStaticReference {
  return (module, exportName, identifier) => {
    const relativePath = getFilename(
      module.pathData.path,
      modulePath,
      {},
      inputData.params
    );
    return {
      identifier:
        identifier === 'type_identifier'
          ? identifierType(interfaceBuilder(exportName).addBody({}))
          : identifierValue(variableBuilder(exportName).setAssignment([])),
      imports: [
        importBuilder()
          .addModules(interfaceBuilder(exportName).addBody({}))
          .addImportLocation(relativePath),
      ],
    } as IStaticReferenceResponse<any>;
  };
}

function createGetGlobalReference<
  Path extends string,
  App extends Application
>({
  modulePath,
  app,
  inputData,
}: {
  modulePath: Path;
  app: App;
  inputData: InputData;
}): GetGlobalReference {
  return async (modulePromise, routes, findFn) => {
    const refPath = (await modulePromise).pathData.path;
    const allData = app.data as Record<string, InputData[]>;

    const referencedModule = app.modules.find(
      (m) => m.pathData.path === refPath
    );
    const moduleData = await referencedModule?.getData(allData[refPath], app);

    const found = moduleData?.filter(({ data }) => findFn(data));

    // in exports
    const foundData = found?.map((found) => ({
      ...found,
      exports: routes.map((route) => found.exports[route as string]),
    }));

    const entities = foundData?.flatMap((val) => val.exports);

    if (!entities || !foundData || !referencedModule || !found) {
      throw new Error('No reference found');
    }

    const allImports = foundData?.map((data) => {
      const relativePath = getFilename(
        referencedModule.pathData.path,
        modulePath,
        data.data.params,
        inputData.params
      );

      return importBuilder()
        .addModules(...data.exports)
        .addImportLocation(relativePath);
    });

    return {
      entities: entities,
      imports: allImports,
      inputData: foundData.map((val) => val.data),
    };
  };
}

function createGetCircularReference<Path extends string>({
  modulePath,
  inputData,
  inputs,
  savedState,
}: {
  modulePath: Path;
  inputData: InputData;
  inputs: InputData[];
  savedState: (Record<string, IEntityBuilder> | undefined)[];
}): GetCircularReference<Path> {
  return () => async (route, findFn) => {
    const refIndex = inputs.findIndex(findFn as any);

    if (refIndex === -1) {
      throw new Error('No reference found');
    }

    const relativePath = getFilename(
      modulePath,
      modulePath,
      inputs[refIndex].params,
      inputData.params
    );

    return {
      identifier: lazyType(() =>
        identifierType(savedState[refIndex]![route as string])
      ),
      imports: [
        importBuilder()
          .addModules(
            lazyImportType(() =>
              importModuleType(savedState[refIndex]![route as string])
            )
          )
          .addImportLocation(relativePath),
      ],
    };
  };
}
