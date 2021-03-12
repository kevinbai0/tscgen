import {
  IEntityBuilder,
  importBuilder,
  IImportBuilder,
  BuildersToImport,
} from 'tscgen';
import { createContext } from './context';
import { getFilename } from './getFilename';
import { OutputType } from './register';
import { GetInputs, OutputModule, TSCGenInputs } from './types';

export async function getReference<
  Routes extends ReadonlyArray<string>,
  Inputs extends GetInputs | undefined
>(
  importFile: Promise<OutputModule<Routes, Inputs>>,
  callerPath: string,
  callerParams: Record<string, string>
): Promise<IReference<Routes, Inputs>> {
  const res = await importFile;
  if (!res.getPath) {
    throw new Error(
      "Can't get references to a file that doesn't export it's path"
    );
  }

  return {
    raw: res,
    referenceInputs: async () =>
      Promise.resolve(res.default)
        .then((val) => val.inputs)
        .then((input) => input?.()) as Promise<ReturnType<NonNullable<Inputs>>>,
    referenceExports<K extends ReadonlyArray<Routes[number]>>(...picks: K) {
      if (!res.getPath) {
        throw new Error("File doesn't reference a path");
      }
      const set = new Set(picks);

      return {
        filter: async (filter: any) => {
          const result = await res.default;
          if (result.inputs) {
            const data = result as OutputType<Routes, NonNullable<Inputs>>;
            const ctx = (
              await createContext(
                data.inputs,
                data.getExports,
                res.getPath,
                callerParams,
                filter ? { filter } : undefined
              )
            ).map((val) => ({
              ...val,
              data: val.exports,
            }));

            return {
              exports: (ctx.flatMap((val) =>
                Object.entries(val.data.values)
                  .filter(([key]) => set.has(key))
                  .map(([, value]) => value)
              ) as unknown) as KeyOfEntity<K>,
              imports: ctx.map(({ data: { values }, inputData }) => {
                return importBuilder()
                  .addModules(
                    ...Object.entries(values)
                      .filter(([key]) => set.has(key))
                      .map(([, value]) => value as IEntityBuilder)
                  )
                  .addImportLocation(
                    getFilename(
                      res.getPath,
                      callerPath,
                      inputData.params,
                      callerParams
                    )
                  );
              }),
            };
          }

          const data = result as OutputType<Routes, undefined>;
          const exportData = await data.getExports();
          return {
            filter: () => {
              return {
                exports: (data.routes.map(
                  (route) =>
                    exportData.exports[route as typeof data.routes[number]]
                ) as unknown) as KeyOfEntity<K>,
                imports: exportData.imports,
              };
            },
          } as any;
        },
      };
    },
  };
}

type ReferenceExports<
  Routes extends ReadonlyArray<string>,
  Inputs extends GetInputs | undefined
> = (
  ...picks: Routes
) => {
  filter: <K extends ReadonlyArray<Routes[number]>>(
    query: Inputs extends GetInputs
      ? (input: TSCGenInputs<Inputs>) => boolean
      : undefined
  ) => Promise<{
    exports: KeyOfEntity<K>;
    imports: Array<
      IImportBuilder<BuildersToImport<[K]>, undefined, undefined, string>
    >;
  }>;
};

interface IReference<
  Routes extends ReadonlyArray<string>,
  Inputs extends GetInputs | undefined
> {
  raw: OutputModule<Routes, Inputs>;
  /**
   *
   * @param options filter and pick
   */
  referenceExports: ReferenceExports<Routes, Inputs>;
  referenceInputs: () => Promise<ReturnType<NonNullable<Inputs>>>;
}

type KeyOfEntity<T> = {
  [Key in keyof T]: T[Key] extends string ? IEntityBuilder : never;
};
