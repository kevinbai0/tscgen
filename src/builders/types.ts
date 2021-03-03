export type IBaseBuilderTypes = 'type' | 'interface' | 'object';
export interface IBaseBuilder<
  Type extends IBaseBuilderTypes,
  Name extends string
> {
  type: Type;
  toString(): string;
  varName: Name;
  markExport(): IBaseBuilder<Type, Name>;
}
