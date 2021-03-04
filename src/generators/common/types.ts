import { IBaseBuilder, IBaseBuilderTypes } from '../core/builders/baseBuilder';

export type IImportModuleType<
  T extends IBaseBuilder<IBaseBuilderTypes, string> = IBaseBuilder<
    IBaseBuilderTypes,
    string
  >
> = {
  type: 'import_module';
  value: T;
};

export type IImportDefaultType<T extends string = string> = {
  type: 'import_default';
  value: T;
};

export type IImportAllModulesType<T extends string = string> = {
  type: 'import_all_modules';
  value: T;
};

export type IImportLocationType<T extends string = string> = {
  type: 'import_location';
  value: T;
};

export type IImportType<
  T extends string | IBaseBuilder<IBaseBuilderTypes, string> = string
> =
  | IImportModuleType<
      T extends IBaseBuilder<IBaseBuilderTypes, string>
        ? T
        : IBaseBuilder<IBaseBuilderTypes, string>
    >
  | IImportLocationType<T extends string ? T : string>
  | IImportDefaultType<T extends string ? T : string>
  | IImportAllModulesType<T extends string ? T : string>;
