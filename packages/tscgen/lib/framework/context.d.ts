import { IEntityBuilder } from '../lib';
import { GetInputs, GetMappedExports, TSCGenInputs } from './types';
export declare function createContext<Inputs extends GetInputs, Exports extends ReadonlyArray<string>>(getInputs: Inputs, mappedExports: GetMappedExports<Inputs, Exports>, getPath: string, options?: {
    filter?: (data: TSCGenInputs<Inputs>) => boolean;
}): Promise<{
    imports?: readonly import("../lib").IBaseBuilder<"import">[] | undefined;
    exports: {
        values: { [Key in Exports[number]]: IEntityBuilder<import("../lib").IEntityBuilderTypes, string>; };
        order: Exports;
    };
    inputData: import("./types").InputData<unknown, Record<string, string>>;
}[]>;
