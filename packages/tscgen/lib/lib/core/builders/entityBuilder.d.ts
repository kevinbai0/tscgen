export declare type IJavascriptBuilderTypes = 'object';
export declare type ITypescriptBuilderTypes = 'type' | 'interface';
export declare type IImportBuilderTypes = 'import';
export declare type IEntityBuilderTypes = IJavascriptBuilderTypes | ITypescriptBuilderTypes;
export declare type IBaseBuilderTypes = IEntityBuilderTypes | IImportBuilderTypes;
export interface IBaseBuilder<Type extends IBaseBuilderTypes = IBaseBuilderTypes> {
    type: Type;
    toString(): string;
}
export interface IEntityBuilder<Type extends IEntityBuilderTypes = IEntityBuilderTypes, Name extends string = string> {
    type: Type;
    toString(): string;
    varName: Name;
    markExport(): IEntityBuilder<Type, Name>;
}
