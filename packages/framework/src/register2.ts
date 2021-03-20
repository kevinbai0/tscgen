import { identifierType, IEntityBuilder, lazyType } from 'tscgen';
import {
  Errors,
  FilePath,
  InputData,
  Output,
  Params,
  ParsedFilePath,
  PathError,
} from './types';

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
      generate: async (callback) => {
        return {
          getData: async (inputs, app) => {
            const savedState: (
              | undefined
              | Record<string, IEntityBuilder>
            )[] = inputs.map(() => undefined);

            return Promise.all(
              inputs.map(async (val) => {
                return {
                  ...(await Promise.resolve(
                    callback({
                      ...val,
                      context: {
                        getReference: () => async (refPath, route, findFn) => {
                          const allData = app.data as Record<
                            string,
                            InputData[]
                          >;

                          if ((refPath as string) === path) {
                            const refIndex = inputs.findIndex(findFn as any);

                            if (refIndex === -1) {
                              throw new Error('No reference found');
                            }

                            return {
                              type: lazyType(() =>
                                identifierType(
                                  savedState[refIndex]![route as string]
                                )
                              ),
                              imports: [],
                            };
                          }
                          const referencedModule = app.modules.find(
                            (m) => m.pathData.path === refPath
                          );
                          const moduleData = await referencedModule?.getData(
                            allData[refPath],
                            app
                          );

                          const found = moduleData?.find(({ data }) =>
                            findFn(data)
                          );

                          // in exports
                          const type = found?.exports[route as string];

                          if (!type) {
                            throw new Error('No reference found');
                          }

                          return {
                            type: identifierType(type),
                            imports: [],
                          };
                        },
                      },
                    })
                  )),
                  data: val,
                };
              })
            );
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
        getData: async () => [
          {
            ...(await Promise.resolve(callback())),
            data: { data: undefined, params: {} },
          },
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
  const isMapped = !!params.length;

  if (isStaticPath(path) && isMapped) {
    return Errors.IsNonConflictingPathError as FilePath<T>;
  }

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

function isStaticPath(value: string): value is `${string}.static.ts` {
  if (value.endsWith('.static.ts')) {
    return true;
  }
  return false;
}
