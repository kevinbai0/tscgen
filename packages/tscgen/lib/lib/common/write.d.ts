import { IImportAllModulesType, IImportDefaultType, IImportModuleType, IImportLocationType, IImportType, IImportLazyType } from './types';
export declare function writeImport(type: IImportType): string;
export declare function writeImportModule(value: IImportModuleType): string;
export declare function writeImportAllModules(value: IImportAllModulesType): string;
export declare function writeImportDefaultModule(value: IImportDefaultType): string;
export declare function writeImportLocation(value: IImportLocationType): string;
export declare function writeImportLazy(value: IImportLazyType): string;
