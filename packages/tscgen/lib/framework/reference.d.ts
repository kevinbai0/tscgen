import { IEntityBuilder } from '../lib/core/builders/entityBuilder';
import { IImportBuilder, BuildersToImport } from '../lib/core/builders/importBuilder';
import { BuilderExports, GetInputs, OutputModule, TSCGenInputs } from './types';
export declare function getReference<Inputs extends GetInputs, MappedExports extends ReadonlyArray<string>, StaticExports extends ReadonlyArray<string>, StaticBuilders extends BuilderExports<StaticExports>>(importFile: Promise<OutputModule<Inputs, MappedExports, StaticExports, StaticBuilders>>, callerPath: string): Promise<IReference<Inputs, MappedExports, StaticExports, StaticBuilders>>;
interface IReference<Inputs extends GetInputs, MappedExports extends ReadonlyArray<string>, StaticExports extends ReadonlyArray<string>, StaticBuilders extends BuilderExports<StaticExports>> {
    raw: OutputModule<Inputs, MappedExports, StaticExports, StaticBuilders>;
    /**
     *
     * @param options filter and pick
     */
    referenceMappedExports<K extends ReadonlyArray<MappedExports[number]>>(...pick: K): {
        filter: (query: (input: TSCGenInputs<Inputs>) => boolean) => Promise<{
            exports: KeyOfEntity<K>;
            imports: Array<IImportBuilder<BuildersToImport<[K]>, undefined, undefined, string>>;
        }>;
    };
}
declare type KeyOfEntity<T> = {
    [Key in keyof T]: T[Key] extends string ? IEntityBuilder : never;
};
export {};
