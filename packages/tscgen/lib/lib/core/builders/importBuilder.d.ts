import { IImportLazyType, IImportModuleType } from '../../common/types';
import { IBaseBuilder, IEntityBuilder, IEntityBuilderTypes } from './entityBuilder';
export declare type BuildersToImport<T> = {
    [Key in keyof T]: T[Key] extends IEntityBuilder<IEntityBuilderTypes, string> ? IImportModuleType<T[Key]> : never;
};
export interface IImportBuilder<Module extends ReadonlyArray<IImportModuleType> = ReadonlyArray<IImportModuleType>, AllModules extends string | undefined = string | undefined, DefaultImport extends string | undefined = string | undefined, Location extends string | undefined = string | undefined> extends IBaseBuilder<'import'> {
    type: 'import';
    addModules: <T extends ReadonlyArray<IEntityBuilder | IImportLazyType<IImportModuleType>>>(...builder: T) => IImportBuilder<[
        ...Module,
        ...BuildersToImport<T>
    ], AllModules, DefaultImport, Location>;
    addDefaultImport: <T extends string>(name: T) => IImportBuilder<Module, AllModules, T, Location>;
    addAllModuleImports: <T extends string>(name: T) => IImportBuilder<Module, T, DefaultImport, Location>;
    addImportLocation: <T extends string>(name: T) => IImportBuilder<Module, AllModules, DefaultImport, T>;
}
export declare function importBuilder<Module extends ReadonlyArray<IImportModuleType> = [], AllModules extends string | undefined = undefined, DefaultImport extends string | undefined = undefined, Location extends string | undefined = undefined>(defaultOptions?: {
    modules: ReadonlyArray<IImportModuleType>;
    allModules?: AllModules;
    defaultImport?: DefaultImport;
    location?: Location;
}): IImportBuilder<Module, AllModules, DefaultImport, Location>;
