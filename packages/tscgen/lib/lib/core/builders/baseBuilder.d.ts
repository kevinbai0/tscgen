export declare type IBaseBuilderTypes = 'type' | 'interface' | 'object' | 'import';
export interface IBaseBuilder<Type extends IBaseBuilderTypes, Name extends string> {
    type: Type;
    toString(): string;
    varName: Name;
    markExport(): IBaseBuilder<Type, Name>;
}
