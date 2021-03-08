/// <reference types="node" />
import { IBaseBuilder, IEntityBuilder } from '../lib/core/builders/entityBuilder';
import { BuilderExports, GetInputs, GetMappedExports, GetMappedExportsBase } from './types';
export declare const createInputsExport: <T, Params extends Record<string, string>>(method: GetInputs<T, Params>) => GetInputs<T, Params>;
export declare const createMappedExports: <Order extends readonly string[]>(...order: Order) => <Inputs extends GetInputs<unknown, Record<string, string>>>(_getInputs: Inputs, getMappedExports: GetMappedExportsBase<Inputs, Order, false>) => GetMappedExports<Inputs, Order, false>;
export declare const createPathExport: (dir: string, filename: string) => [dir: string, filename: string];
export declare const createStaticExports: <Exports extends readonly string[]>(...order: Exports) => (getBuilders: () => Promise<{
    imports: ReadonlyArray<IBaseBuilder<'import'>>;
    exports: Record<Exports[number], IEntityBuilder<import("../lib/core/builders/entityBuilder").IEntityBuilderTypes, string>>;
}>) => () => Promise<BuilderExports<Exports, false>>;
export declare function createExports<T extends ReadonlyArray<IEntityBuilder>>(imports: IBaseBuilder<'import'>[], ...exports: T): {
    exports: T;
    imports: IBaseBuilder<'import'>[];
};
export declare type BuilderFromKeys<T> = {
    [Key in keyof T]: T[Key] extends string ? IEntityBuilder : never;
};
