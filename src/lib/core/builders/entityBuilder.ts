export type IJavascriptBuilderTypes = 'object';
export type ITypescriptBuilderTypes = 'type' | 'interface';
export type IImportBuilderTypes = 'import';

export type IEntityBuilderTypes =
  | IJavascriptBuilderTypes
  | ITypescriptBuilderTypes;

export type IBaseBuilderTypes = IEntityBuilderTypes | IImportBuilderTypes;

export interface IBaseBuilder<
  Type extends IBaseBuilderTypes = IBaseBuilderTypes
> {
  type: Type;
  toString(): string;
}
export interface IEntityBuilder<
  Type extends IEntityBuilderTypes = IEntityBuilderTypes,
  Name extends string = string
> {
  type: Type;
  toString(): string;
  varName: Name;
  markExport(): IEntityBuilder<Type, Name>;
}
