import { IGenericInterfaceBuilder } from './interfaceBuilder';
import { IGenericTypeAliasBuilder } from './typeBuilder';
import { IVariableBuilder } from './variableBuilder';

export type IJavascriptBuilderTypes = 'variable';
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
  as<Identifier extends IEntityBuilderTypes>(
    identifier: Identifier
  ): Identifier extends 'type'
    ? IGenericTypeAliasBuilder
    : Identifier extends 'interface'
    ? IGenericInterfaceBuilder
    : IVariableBuilder;
  markExport(defaultExport?: boolean): IEntityBuilder<Type, Name>;
}
