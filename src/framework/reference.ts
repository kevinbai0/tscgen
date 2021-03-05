import path from 'path';
import { IBaseBuilder } from '../lib/core/builders/baseBuilder';
import {
  importBuilder,
  IImportBuilder,
  BuildersToImport,
} from '../lib/core/builders/importBuilder';
import { GetInputs, OutputModule } from './types';

export async function getReference<
  Inputs extends GetInputs,
  MappedBuilders extends ReadonlyArray<
    IBaseBuilder<'interface' | 'type', string>
  >,
  StaticBuilders extends ReadonlyArray<
    IBaseBuilder<'interface' | 'type', string>
  >
>(
  importFile: Promise<OutputModule<Inputs, MappedBuilders, StaticBuilders>>,
  callerPath: string
): Promise<IReference<Inputs, MappedBuilders, StaticBuilders>> {
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
      const inputs = await Promise.resolve(res.getInputs!());
      // add search filter later

      const exports = await Promise.all(
        inputs.map(async (val) => ({
          data: pick(await res.getMappedExports!(val.data)),
          params: val.params,
        }))
      );
      const callerComponents = callerPath.split('/');
      const referenceComponents = res.getPath.split('/');
      const relativePath = path.relative(
        callerComponents.slice(0, -1).join('/'),
        referenceComponents.slice(0, -1).join('/')
      );
      const dir = relativePath.startsWith('..')
        ? relativePath
        : `./${relativePath}`;

      return {
        exports: exports.map((val) => val.data),
        imports: exports.map((val) => {
          const outFile = Object.entries(val.params).reduce(
            (acc, [key, value]) => acc.replace(`[${key}]`, value),
            referenceComponents.slice(-1)[0].split('.').slice(0, -1).join('.')
          );

          return importBuilder()
            .addModules(val.data)
            .addImportLocation(`${dir}/${outFile}`);
        }),
      };
    },
  };
}

interface IReference<
  Inputs extends GetInputs,
  MappedBuilders extends ReadonlyArray<
    IBaseBuilder<'interface' | 'type', string>
  >,
  StaticBuilders extends ReadonlyArray<
    IBaseBuilder<'interface' | 'type', string>
  >
> {
  raw: OutputModule<Inputs, MappedBuilders, StaticBuilders>;
  referenceMappedExports<
    K extends ReturnType<
      NonNullable<
        OutputModule<
          Inputs,
          MappedBuilders,
          StaticBuilders,
          true
        >['getMappedExports']
      >
    >[number]
  >(
    pick: (
      value: ReturnType<
        NonNullable<
          OutputModule<
            Inputs,
            MappedBuilders,
            StaticBuilders,
            true
          >['getMappedExports']
        >
      >
    ) => K
  ): Promise<{
    exports: Array<K>;
    imports: Array<
      IImportBuilder<BuildersToImport<[K]>, undefined, undefined, string>
    >;
  }>;
}
