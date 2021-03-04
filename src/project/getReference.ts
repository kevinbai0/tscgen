import { IBaseBuilder } from '../generators/core/builders/baseBuilder';

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
  referenceMappedExports(): Promise<
    Array<
      ReturnType<
        NonNullable<
          OutputModule<
            Inputs,
            MappedBuilders,
            StaticBuilders,
            true
          >['getMappedExports']
        >
      >
    >
  >;
}

export async function getReference<
  Inputs extends GetInputs<any>,
  MappedBuilders extends ReadonlyArray<
    IBaseBuilder<'interface' | 'type', string>
  >,
  StaticBuilders extends ReadonlyArray<
    IBaseBuilder<'interface' | 'type', string>
  >
>(
  importFile: Promise<OutputModule<Inputs, MappedBuilders, StaticBuilders>>
): Promise<IReference<Inputs, MappedBuilders, StaticBuilders>> {
  const res = await importFile;
  if (!res.getPath) {
    throw new Error(
      "Can't get references to a file that doesn't export it's path"
    );
  }
  return {
    raw: res,
    async referenceMappedExports() {
      const inputs = await Promise.resolve(res.getInputs!());
      // add search filter later
      const toUse = inputs.map((val) => val.data).filter(() => true);

      return await Promise.all(toUse.map((val) => res.getMappedExports!(val)));
    },
  };
}

export type InputData<T = any> = {
  params: Record<string, string>;
  data: T;
};

type GetInputs<T> = () => Promiseable<Array<InputData<T>>>;
type GetMappedExports<
  Inputs extends GetInputs<any>,
  Builders extends ReadonlyArray<IBaseBuilder<'type' | 'interface', string>>,
  Unpromise = false
> = (
  inputs: TSCGenInputs<Inputs>
) => Unpromise extends true ? [...Builders] : Promiseable<[...Builders]>;
type GetStaticExports<
  Builders extends ReadonlyArray<IBaseBuilder<'type' | 'interface', string>>
> = () => Promiseable<Builders>;

export const createInputsExport = <T>(method: GetInputs<T>): GetInputs<T> =>
  method;

export const createMappedExports = <
  Inputs extends GetInputs<any>,
  Builders extends ReadonlyArray<IBaseBuilder<'type' | 'interface', string>>
>(
  _inputs: Inputs,
  getBuilders: GetMappedExports<Inputs, Builders>
): GetMappedExports<Inputs, Builders> => {
  return getBuilders;
};
export const createPathExport = (...path: [dir: string, filename: string]) =>
  path;
export const createStaticExports = <
  Builders extends ReadonlyArray<IBaseBuilder<'type' | 'interface', string>>
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

export function createOutFile<T extends OutputModule>(module: T): T {
  return module;
}
