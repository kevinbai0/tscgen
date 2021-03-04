import path from 'path';
import {
  IBaseBuilder,
  IBaseBuilderTypes,
} from '../generators/core/builders/baseBuilder';
import {
  importBuilder,
  IImportBuilder,
  BuildersToImport,
} from '../generators/core/builders/importBuilder';

type Promiseable<T> = T | Promise<T>;
type Unpromise<T> = T extends Promise<infer U> ? U : never;

interface IReference<
  Inputs extends GetInputs<any>,
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
  callerPath: [dir: string, filename: string]
): Promise<IReference<Inputs, MappedBuilders, StaticBuilders>> {
  const res = await importFile;
  if (!res.getPath) {
    throw new Error(
      "Can't get references to a file that doesn't export it's path"
    );
  }
  return {
    raw: res,
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
      const relativePath = path.relative(callerPath[0], res.getPath[0]);
      const dir = relativePath.startsWith('..')
        ? relativePath
        : `./${relativePath}`;

      return {
        exports: exports.map((val) => val.data),
        imports: exports.map((val) => {
          const beforeReplace = res
            .getPath![1].split('.')
            .slice(0, -2)
            .join('/');

          const outFile = Object.entries(val.params).reduce(
            (acc, [key, value]) => acc.replace(`[${key}]`, value),
            beforeReplace
          );

          return importBuilder()
            .addModules(val.data)
            .addImportLocation(`${dir}/${outFile}`);
        }),
      };
    },
  };
}

export type InputData<T = any> = {
  params: Record<string, string>;
  data: T;
};

type GetInputs<T = any> = () => Promiseable<Array<InputData<T>>>;
type GetMappedExports<
  Inputs extends GetInputs<any>,
  Builders extends ReadonlyArray<IBaseBuilder<IBaseBuilderTypes, string>>,
  Unpromise = false
> = (
  inputs: TSCGenInputs<Inputs>
) => Unpromise extends true ? [...Builders] : Promiseable<[...Builders]>;
type GetStaticExports<
  Builders extends ReadonlyArray<IBaseBuilder<IBaseBuilderTypes, string>>
> = () => Promiseable<Builders>;

export const createInputsExport = <T>(method: GetInputs<T>): GetInputs<T> =>
  method;

export const createMappedExports = <
  Inputs extends GetInputs<any>,
  Builders extends ReadonlyArray<IBaseBuilder<IBaseBuilderTypes, string>>
>(
  _inputs: Inputs,
  getBuilders: GetMappedExports<Inputs, Builders>
): GetMappedExports<Inputs, Builders> => {
  return getBuilders;
};
export const createPathExport = (...path: [dir: string, filename: string]) =>
  path;
export const createStaticExports = <
  Builders extends ReadonlyArray<IBaseBuilder<IBaseBuilderTypes, string>>
>(
  getBuilders: () => Promise<[...Builders]>
): GetStaticExports<Builders> => {
  return getBuilders;
};

export type TSCGenBuilders<
  T extends (
    data: any
  ) => ReadonlyArray<IBaseBuilder<'type' | 'interface', string>>
> = ReturnType<T>;

export type TSCGenInputs<T extends GetInputs<any>> = Unpromise<
  ReturnType<T>
>[number]['data'];

export type OutputModule<
  Inputs extends GetInputs<any> = GetInputs<any>,
  MappedBuilders extends ReadonlyArray<
    IBaseBuilder<'interface' | 'type', string>
  > = ReadonlyArray<IBaseBuilder<'interface' | 'type', string>>,
  StaticBuilders extends ReadonlyArray<
    IBaseBuilder<'interface' | 'type', string>
  > = ReadonlyArray<IBaseBuilder<'interface' | 'type', string>>,
  Unpromise extends boolean = false
> = {
  getStaticExports?: GetStaticExports<StaticBuilders>;
  getPath?: [dir: string, filename: string];
  getMappedExports?: GetMappedExports<Inputs, MappedBuilders, Unpromise>;
  getInputs?: Inputs;
};
