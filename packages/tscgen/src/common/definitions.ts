import { IEntityBuilder } from '../core/builders/entityBuilder';
import { IImportLazyType, IImportModuleType, IImportType } from './types';

export function lazyImportType<T extends IImportType>(
  value: () => T
): IImportLazyType<T> {
  return {
    type: 'import_lazy',
    value,
  };
}

export function importModuleType<T extends IEntityBuilder>(
  value: T
): IImportModuleType {
  return {
    type: 'import_module',
    value: value,
  };
}
