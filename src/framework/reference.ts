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
    async referenceMappedExports(pick) {
      if (!res.getPath) {
        throw new Error("File doesn't reference a path");
      }

      const ctx = (
        await createContext(res.getInputs!, res.getMappedExports!, res.getPath)
      ).map((val) => ({
        ...val,
        data: pick(val.exports),
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
  referenceMappedExports<K extends MappedBuilders['exports'][number]>(
    pick: (value: MappedBuilders['exports']) => K,
    options?: {
      filter?: () => TSCGenInputs<Inputs>;
    }
  ): Promise<{
    exports: Array<K>;
    imports: Array<
      IImportBuilder<BuildersToImport<[K]>, undefined, undefined, string>
    >;
  }>;
}
