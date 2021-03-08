import { IEntityBuilder } from '../lib/core/builders/entityBuilder';
import {
  importBuilder,
  IImportBuilder,
  BuildersToImport,
} from '../lib/core/builders/importBuilder';
import { createContext } from './context';
import { getFilename } from './getFilename';
import { BuilderExports, GetInputs, OutputModule, TSCGenInputs } from './types';

export async function getReference<
  Inputs extends GetInputs,
  MappedExports extends ReadonlyArray<string>,
  StaticExports extends ReadonlyArray<string>,
  StaticBuilders extends BuilderExports<StaticExports>
>(
  importFile: Promise<
    OutputModule<Inputs, MappedExports, StaticExports, StaticBuilders>
  >,
  callerPath: string
): Promise<IReference<Inputs, MappedExports, StaticExports, StaticBuilders>> {
  const res = await importFile;
  if (!res.getPath) {
    throw new Error(
      "Can't get references to a file that doesn't export it's path"
    );
  }
  return {
    raw: res,
    referenceMappedExports<K extends ReadonlyArray<MappedExports[number]>>(
      ...picks: K
    ) {
      if (!res.getPath) {
        throw new Error("File doesn't reference a path");
      }
      const set = new Set(picks);

      return {
        filter: async (method) => {
          const ctx = (
            await createContext(
              res.getInputs!,
              res.getMappedExports!,
              res.getPath,
              { filter: method }
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
                  getFilename(res.getPath, callerPath, inputData.params)
                );
            }),
          };
        },
      };
    },
  };
}

interface IReference<
  Inputs extends GetInputs,
  MappedExports extends ReadonlyArray<string>,
  StaticExports extends ReadonlyArray<string>,
  StaticBuilders extends BuilderExports<StaticExports>
> {
  raw: OutputModule<Inputs, MappedExports, StaticExports, StaticBuilders>;
  /**
   *
   * @param options filter and pick
   */
  referenceMappedExports<K extends ReadonlyArray<MappedExports[number]>>(
    ...pick: K
  ): {
    filter: (
      query: (input: TSCGenInputs<Inputs>) => boolean
    ) => Promise<{
      exports: KeyOfEntity<K>;
      imports: Array<
        IImportBuilder<BuildersToImport<[K]>, undefined, undefined, string>
      >;
    }>;
  };
}

type KeyOfEntity<T> = {
  [Key in keyof T]: T[Key] extends string ? IEntityBuilder : never;
};
