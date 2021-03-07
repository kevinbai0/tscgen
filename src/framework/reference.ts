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
  MappedExports extends [...IEntityBuilder[]],
  StaticExports extends [...IEntityBuilder[]],
  MappedBuilders extends BuilderExports<MappedExports>,
  StaticBuilders extends BuilderExports<StaticExports>
>(
  importFile: Promise<
    OutputModule<
      Inputs,
      MappedExports,
      StaticExports,
      MappedBuilders,
      StaticBuilders
    >
  >,
  callerPath: string
): Promise<
  IReference<
    Inputs,
    MappedExports,
    StaticExports,
    MappedBuilders,
    StaticBuilders
  >
> {
  const res = await importFile;
  if (!res.getPath) {
    throw new Error(
      "Can't get references to a file that doesn't export it's path"
    );
  }
  return {
    raw: res,
    // eslint-disable-next-line @typescript-eslint/typedef
    async referenceMappedExports(options) {
      if (!res.getPath) {
        throw new Error("File doesn't reference a path");
      }

      const ctx = (
        await createContext(
          res.getInputs!,
          res.getMappedExports!,
          res.getPath,
          options
        )
      ).map((val) => ({
        ...val,
        data: options.pick(val.exports),
      }));

      return {
        exports: ctx.map((val) => val.data),
        imports: ctx.map(({ data, inputData }) => {
          return importBuilder()
            .addModules(data)
            .addImportLocation(
              getFilename(res.getPath, callerPath, inputData.params)
            );
        }),
      };
    },
  };
}

interface IReference<
  Inputs extends GetInputs,
  MappedExports extends [...IEntityBuilder[]],
  StaticExports extends [...IEntityBuilder[]],
  MappedBuilders extends BuilderExports<MappedExports>,
  StaticBuilders extends BuilderExports<StaticExports>
> {
  raw: OutputModule<
    Inputs,
    MappedExports,
    StaticExports,
    MappedBuilders,
    StaticBuilders
  >;
  /**
   *
   * @param options filter and pick
   */
  referenceMappedExports<K extends MappedBuilders['exports'][number]>(options: {
    filter?: (data: TSCGenInputs<Inputs>) => boolean;
    /**
     * Pick the specific entity builder from the list of exported entities of that file
     */
    pick: (value: MappedBuilders['exports']) => K;
  }): Promise<{
    exports: Array<K>;
    imports: Array<
      IImportBuilder<BuildersToImport<[K]>, undefined, undefined, string>
    >;
  }>;
}
