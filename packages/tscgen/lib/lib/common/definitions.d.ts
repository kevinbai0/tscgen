import { IEntityBuilder } from '../../framework';
import { IImportLazyType, IImportModuleType, IImportType } from './types';
export declare function lazyImportType<T extends IImportType>(value: () => T): IImportLazyType<T>;
export declare function importModuleType<T extends IEntityBuilder>(value: T): IImportModuleType;
