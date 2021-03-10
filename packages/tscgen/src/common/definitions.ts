import { IEntityBuilder } from '../core/builders/entityBuilder';
import { IImportLazyType, IImportModuleType, IImportType } from './types';

/**
 * Create a lazy import type to be computed only when written
 * @param value - closure that returns the import type to be computed lazily
 * @returns
 * @public
 */
export function lazyImportType<T extends IImportType>(
  value: () => T
): IImportLazyType<T> {
  return {
    type: 'import_lazy',
    value,
  };
}

/**
 * Specify a module for the import declaration
 * @param value - Specify the module to import {@link IEntityBuilder}
 * @returns
 * @public
 */
export function importModuleType<T extends IEntityBuilder>(
  value: T
): IImportModuleType {
  return {
    type: 'import_module',
    value: value,
  };
}
