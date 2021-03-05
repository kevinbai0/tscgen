import {
  IEntityBuilder,
  IEntityBuilderTypes,
} from '../core/builders/entityBuilder';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IImportType<T extends any = any> =
  | IImportModuleType<
      T extends IEntityBuilder<IEntityBuilderTypes, string>
        ? T
        : IEntityBuilder<IEntityBuilderTypes, string>
    >
  | IImportLocationType<T extends string ? T : string>
  | IImportDefaultType<T extends string ? T : string>
  | IImportAllModulesType<T extends string ? T : string>
  | IImportLazyType<T extends IImportType ? T : IImportType>;

export interface IImportModuleType<
  T extends IEntityBuilder<IEntityBuilderTypes, string> = IEntityBuilder<
    IEntityBuilderTypes,
    string
  >
> {
  type: 'import_module';
  value: T;
}

export interface IImportDefaultType<T extends string = string> {
  type: 'import_default';
  value: T;
}

export interface IImportAllModulesType<T extends string = string> {
  type: 'import_all_modules';
  value: T;
}

export interface IImportLocationType<T extends string = string> {
  type: 'import_location';
  value: T;
}

export interface IImportLazyType<T extends IImportType = IImportType> {
  type: 'import_lazy';
  value: () => T;
}
