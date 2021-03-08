import { IIdentifierType, IImportBuilder, ILazyType } from '../lib';
import { IBaseBuilder, IEntityBuilder } from '../lib/core/builders/entityBuilder';
import { Promiseable, Unpromise } from '../lib/helpers/promise';
export declare type InputData<T = unknown, Params extends Record<string, string> = Record<string, string>> = {
    params: Params;
    data: T;
};
export declare type BuilderExports<Exports extends ReadonlyArray<string>, OmitOrder extends boolean = false> = {
    imports?: ReadonlyArray<IBaseBuilder<'import'>>;
    exports: OmitOrder extends true ? {
        [Key in Exports[number]]: IEntityBuilder;
    } : {
        values: {
            [Key in Exports[number]]: IEntityBuilder;
        };
        order: Exports;
    };
};
export declare type Context<Inputs extends GetInputs, Order extends ReadonlyArray<string>> = {
    referenceIdentifier<K extends Order[number]>(pick: K): {
        findOne: (data: (inputs: TSCGenInputs<Inputs>) => unknown) => {
            importValue: IImportBuilder;
            typeIdentifier: ILazyType<IIdentifierType>;
        };
    };
};
export declare type GetInputs<T = unknown, Params extends Record<string, string> = Record<string, string>> = () => Promiseable<Array<InputData<T, Params>>>;
export declare type GetMappedExportsBase<Inputs extends GetInputs, Keys extends ReadonlyArray<string>, Unpromise extends boolean = false> = (options: TSCGenInputs<Inputs> & {
    context: Context<Inputs, Keys>;
}) => Unpromise extends true ? BuilderExports<Keys, true> : Promiseable<BuilderExports<Keys, true>>;
export declare type GetMappedExports<Inputs extends GetInputs, Keys extends ReadonlyArray<string>, Unpromise extends boolean = false> = (options: TSCGenInputs<Inputs> & {
    context: Context<Inputs, Keys>;
}) => Unpromise extends true ? BuilderExports<Keys> : Promiseable<BuilderExports<Keys>>;
export declare type GetStaticExports<Exports extends ReadonlyArray<string>, Builders extends BuilderExports<Exports>> = () => Promiseable<Builders>;
export declare type TSCGenBuilders<T extends GetMappedExports<GetInputs, ReadonlyArray<string>>> = Unpromise<ReturnType<T>>;
export declare type TSCGenInputs<T extends GetInputs> = Unpromise<ReturnType<T>>[number];
export declare type OutputModule<Inputs extends GetInputs = GetInputs, MappedExports extends ReadonlyArray<string> = ReadonlyArray<string>, StaticExports extends ReadonlyArray<string> = ReadonlyArray<string>, StaticBuilders extends BuilderExports<StaticExports> = BuilderExports<StaticExports>, Unpromise extends boolean = false> = {
    getStaticExports?: GetStaticExports<StaticExports, StaticBuilders>;
    getPath: string;
    getMappedExports?: GetMappedExports<Inputs, MappedExports, Unpromise>;
    getInputs?: Inputs;
};
