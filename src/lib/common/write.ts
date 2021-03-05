import {
  IImportAllModulesType,
  IImportDefaultType,
  IImportModuleType,
  IImportLocationType,
  IImportType,
  IImportLazyType,
} from './types';

export function writeImport(type: IImportType): string {
  switch (type.type) {
    case 'import_module':
      return writeImportModule(type);
    case 'import_all_modules':
      return writeImportAllModules(type);
    case 'import_default':
      return writeImportDefaultModule(type);
    case 'import_location':
      return writeImportLocation(type);
    case 'import_lazy':
      return writeImportLazy(type);
  }
}

export function writeImportModule(value: IImportModuleType): string {
  return `${value.value.varName}`;
}

export function writeImportAllModules(value: IImportAllModulesType): string {
  return `* as ${value.value}`;
}

export function writeImportDefaultModule(value: IImportDefaultType): string {
  return `${value.value}`;
}

export function writeImportLocation(value: IImportLocationType): string {
  return `'${value.value}'`;
}

export function writeImportLazy(value: IImportLazyType): string {
  return writeImport(value.value());
}
