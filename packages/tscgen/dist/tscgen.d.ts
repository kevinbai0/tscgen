
export declare function arrayType<T extends IType>(type: T, ...extract: ITypePropertyType[]): IArrayType<T>;

export declare function arrayValue(...values: IJsValue[]): IJsArrayValue;

declare type BooleanLiterals<T extends Readonly<boolean[]>> = {
    [P in keyof T]: T[P] extends boolean ? IBooleanLiteralType<T[P]> : never;
};

export declare function booleanTuple<T extends Readonly<boolean[]>>(...type: T): ITupleType<BooleanLiterals<T>>;

export declare function booleanType(): IBooleanType;

export declare function booleanType<T extends boolean[]>(...value: T): IUnionType<BooleanLiterals<T>>;

export declare type BuildersToImport<T> = {
    [Key in keyof T]: T[Key] extends IBaseBuilder<IBaseBuilderTypes, string> ? IImportModuleType<T[Key]> : never;
};

declare type Combine<T, K> = {
    [Key in keyof T | keyof K]: Key extends keyof K ? K[Key] : Key extends keyof T ? T[Key] : never;
};

export declare function combine(...builders: IBaseBuilder<IBaseBuilderTypes, string>[]): string;

export declare const createFormatter: (pathToFile: string) => (text: string) => Promise<string>;

export declare const createInputsExport: <T>(method: GetInputs<T>) => GetInputs<T>;

export declare const createMappedExports: <Inputs extends GetInputs<any>, Builders extends readonly IBaseBuilder<IBaseBuilderTypes, string>[]>(_inputs: Inputs, getBuilders: GetMappedExports<Inputs, Builders, false>) => GetMappedExports<Inputs, Builders, false>;

export declare const createPathExport: (dir: string, filename: string) => [dir: string, filename: string];

export declare const createStaticExports: <Builders extends readonly IBaseBuilder<IBaseBuilderTypes, string>[]>(getBuilders: () => Promise<[...Builders]>) => GetStaticExports<Builders>;

export declare function extract<T extends IType, K extends Readonly<IType[]>, U extends IUnionType<K>>(type: T, union: U): IDecorationType<[T, U]>;

export declare function genericType<T extends string>(value: T): IGenericIdentifierType<T>;

declare type GetInputs<T = any> = () => Promiseable<Array<InputData<T>>>;

declare type GetMappedExports<Inputs extends GetInputs<any>, Builders extends ReadonlyArray<IBaseBuilder<IBaseBuilderTypes, string>>, Unpromise = false> = (inputs: TSCGenInputs<Inputs>) => Unpromise extends true ? [...Builders] : Promiseable<[...Builders]>;

export declare function getReference<Inputs extends GetInputs, MappedBuilders extends ReadonlyArray<IBaseBuilder<'interface' | 'type', string>>, StaticBuilders extends ReadonlyArray<IBaseBuilder<'interface' | 'type', string>>>(importFile: Promise<OutputModule<Inputs, MappedBuilders, StaticBuilders>>, callerPath: string): Promise<IReference<Inputs, MappedBuilders, StaticBuilders>>;

declare type GetStaticExports<Builders extends ReadonlyArray<IBaseBuilder<IBaseBuilderTypes, string>>> = () => Promiseable<Builders>;

export declare interface IArrayType<T extends IType = IType> {
    type: 'array';
    definition: T;
    extract?: ITypePropertyType[];
}

export declare interface IBaseBuilder<Type extends IBaseBuilderTypes, Name extends string> {
    type: Type;
    toString(): string;
    varName: Name;
    markExport(): IBaseBuilder<Type, Name>;
}

export declare type IBaseBuilderTypes = 'type' | 'interface' | 'object' | 'import';

export declare interface IBodyType {
    [key: string]: IType | [IType, boolean];
}

export declare interface IBooleanLiteralType<T extends boolean = boolean> {
    type: 'boolean_literal';
    definition: T;
}

export declare interface IBooleanType {
    type: 'boolean';
}

export declare interface IDecorationType<T extends Readonly<IType[]> = Readonly<IType[]>> {
    type: 'decoration';
    definition: T;
    decorate: (...value: string[]) => string;
}

/**
 *
 * @param builder The name of the interace/type
 * @param extract Properties to extract for the identifier (eg: ITest[number][string])
 */
export declare function identifierType<T extends IBaseBuilder<'type' | 'interface', string>>(builder: T, ...extract: ITypePropertyType[]): IIdentifierType;

/**
 *
 * @param builder The name of the interace/type
 * @param extract Properties to extract for the identifier (eg: ITest[number][string])
 */
export declare function identifierValue<Type extends IBaseBuilderTypes, Name extends string>(builder: IBaseBuilder<Type, Name>): IJsIdentifierValue;

export declare type IGenericIdentifierType<T extends string = string> = {
    type: 'generic_identifier';
    definition: T;
};

export declare type IGenericOptions = {
    extendsValue?: IType;
    defaultValue?: IType;
} | undefined;

export declare type IGenericValue<Name extends string = string, Options extends IGenericOptions = undefined> = {
    name: Name;
    options: Options;
};

export declare interface IIdentifierType<T extends IBaseBuilder<'type' | 'interface', string> = IBaseBuilder<'type' | 'interface', string>> {
    type: 'identifier';
    definition: T;
    extract?: ITypePropertyType[];
}

export declare interface IImportBuilder<Module extends ReadonlyArray<IImportModuleType>, AllModules extends string | undefined, DefaultImport extends string | undefined, Location extends string | undefined> extends IBaseBuilder<'import', string> {
    type: 'import';
    addModules: <T extends ReadonlyArray<IBaseBuilder<IBaseBuilderTypes, string>>>(...builder: T) => IImportBuilder<[
        ...Module,
        ...BuildersToImport<T>
    ], AllModules, DefaultImport, Location>;
    addDefaultImport: <T extends string>(name: T) => IImportBuilder<Module, AllModules, T, Location>;
    addAllModuleImports: <T extends string>(name: T) => IImportBuilder<Module, T, DefaultImport, Location>;
    addImportLocation: <T extends string>(name: T) => IImportBuilder<Module, AllModules, DefaultImport, T>;
}

declare type IImportModuleType<T extends IBaseBuilder<IBaseBuilderTypes, string> = IBaseBuilder<IBaseBuilderTypes, string>> = {
    type: 'import_module';
    value: T;
};

export declare interface IInterfaceBuilder<Name extends string, Generics extends Readonly<IGenericValue<string, IGenericOptions | undefined>[]>, Body extends IBodyType, Exported extends boolean, Extend extends IIdentifierType<IBaseBuilder<'interface', string>> | undefined> extends IBaseBuilder<'interface', Name> {
    type: 'interface';
    addGeneric<N extends string, Options extends IGenericOptions = {}, T extends Readonly<IGenericValue<N, Options>> = Readonly<IGenericValue<N, Options>>>(name: N, options?: Options): IInterfaceBuilder<Name, [...Generics, T], Body, Exported, Extend>;
    addBody<T extends IBodyType>(body: T): IInterfaceBuilder<Name, Generics, Combine<Body, T>, Exported, Extend>;
    extends<T extends IBaseBuilder<'interface', string>>(type: T): IInterfaceBuilder<Name, Generics, Body, Exported, IIdentifierType<T>>;
    markExport(): IInterfaceBuilder<Name, Generics, Body, true, Extend>;
    body: Body;
    generics: Generics;
}

declare interface IJsArrayValue {
    type: 'array';
    value: IJsValue[];
}

declare interface IJsBodyValue {
    [key: string]: IJsValue;
}

declare interface IJsBooleanValue {
    type: 'boolean';
    value: boolean;
}

declare interface IJsIdentifierValue {
    type: 'identifier';
    value: string;
}

declare interface IJsNumberValue {
    type: 'number';
    value: number;
}

declare interface IJsObjectValue {
    type: 'object';
    value: IJsBodyValue;
}

declare interface IJsStringValue {
    type: 'string';
    value: string;
}

declare type IJsValue = IJsStringValue | IJsBooleanValue | IJsNumberValue | IJsArrayValue | IJsObjectValue | IJsIdentifierValue;

export declare function importBuilder<Module extends ReadonlyArray<IImportModuleType> = [], AllModules extends string | undefined = undefined, DefaultImport extends string | undefined = undefined, Location extends string | undefined = undefined>(defaultOptions?: {
    modules: ReadonlyArray<IImportModuleType>;
    allModules?: AllModules;
    defaultImport?: DefaultImport;
    location?: Location;
}): IImportBuilder<Module, AllModules, DefaultImport, Location>;

declare type InputData<T = any> = {
    params: Record<string, string>;
    data: T;
};

export declare function interfaceBuilder<Name extends string, Generics extends Readonly<IGenericValue[]> = [], Body extends IBodyType = {}, Exported extends boolean = false, Extend extends IIdentifierType<IBaseBuilder<'interface', string>> | undefined = undefined>(interfaceName: Name, defaultOptions?: {
    generics?: Generics;
    extends?: Extend;
    body: Body;
    export: boolean;
}): IInterfaceBuilder<Name, Generics, Body, Exported, Extend>;

export declare interface INullType {
    type: 'null';
}

export declare interface INumberLiteralType<T extends number = number> {
    type: 'number_literal';
    definition: T;
}

export declare interface INumberType {
    type: 'number';
}

export declare type IObjectType<T extends IBodyType = IBodyType> = {
    type: 'object';
    definition: T;
    extract?: ITypePropertyType[];
};

export declare type IRawIdentifierType = {
    type: 'raw_identifier';
    definition: string;
};

export declare interface IRawTypePropertyType {
    type: 'raw_property_type';
    definition: string;
}

declare interface IReference<Inputs extends GetInputs, MappedBuilders extends ReadonlyArray<IBaseBuilder<'interface' | 'type', string>>, StaticBuilders extends ReadonlyArray<IBaseBuilder<'interface' | 'type', string>>> {
    raw: OutputModule<Inputs, MappedBuilders, StaticBuilders>;
    referenceMappedExports<K extends ReturnType<NonNullable<OutputModule<Inputs, MappedBuilders, StaticBuilders, true>['getMappedExports']>>[number]>(pick: (value: ReturnType<NonNullable<OutputModule<Inputs, MappedBuilders, StaticBuilders, true>['getMappedExports']>>) => K): Promise<{
        exports: Array<K>;
        imports: Array<IImportBuilder<BuildersToImport<[K]>, undefined, undefined, string>>;
    }>;
}

export declare interface IStringLiteralType<T extends string = string> {
    type: 'string_literal';
    definition: T;
}

export declare interface IStringType {
    type: 'string';
}

export declare interface ITupleType<T extends ReadonlyArray<IType> = ReadonlyArray<IType>> {
    type: 'tuple';
    definition: T;
    extract?: ITypePropertyType[];
}

export declare type IType<T extends any = any> = IStringType | INumberType | IBooleanType | IUndefinedType | INullType | IIdentifierType<T extends IBaseBuilder<'type' | 'interface', string> ? T : IBaseBuilder<'type' | 'interface', string>> | IArrayType<T extends IType ? T : IType> | IObjectType<T extends IBodyType ? T : IBodyType> | IUnionType<T extends Readonly<IType[]> ? T : Readonly<IType[]>> | IStringLiteralType<T extends string ? T : string> | INumberLiteralType<T extends number ? T : number> | IBooleanLiteralType<T extends boolean ? T : boolean> | ITupleType<T extends Readonly<IType[]> ? T : Readonly<IType[]>> | IDecorationType<T extends Readonly<IType[]> ? T : Readonly<IType[]>> | IGenericIdentifierType<T extends string ? T : string> | IRawIdentifierType;

export declare interface ITypeDefBuilder<Name extends string, Generics extends Readonly<IGenericValue<string, IGenericOptions>[]>, JoinedTypes extends ReadonlyArray<{
    type: IType;
    joinType: 'union' | 'intersection';
}>, Exported extends boolean> extends IBaseBuilder<'type', Name> {
    type: 'type';
    addUnion<T extends ReadonlyArray<IType>>(...type: T): ITypeDefBuilder<Name, Generics, [
        ...JoinedTypes,
        ...JoinType<'union', T>
    ], Exported>;
    addIntersection<T extends ReadonlyArray<IType>>(...type: IType[]): ITypeDefBuilder<Name, Generics, [
        ...JoinedTypes,
        ...JoinType<'intersection', T>
    ], Exported>;
    addGeneric<N extends string, Options extends IGenericOptions = {}, T extends Readonly<IGenericValue<N, Options>> = Readonly<IGenericValue<N, Options>>>(name: N, options?: Options): ITypeDefBuilder<Name, [...Generics, T], JoinedTypes, Exported>;
    markExport(): ITypeDefBuilder<Name, Generics, JoinedTypes, Exported>;
}

export declare type ITypePropertyType = IStringType | INumberType | IBooleanType | IStringLiteralType | INumberLiteralType | IBooleanLiteralType | IIdentifierType | IRawTypePropertyType;

export declare interface IUndefinedType {
    type: 'undefined';
}

export declare interface IUnionType<T extends Readonly<IType[]> = []> {
    type: 'union';
    definition: T;
    extract?: ITypePropertyType[];
}

declare interface IVarObjectBuilder extends IBaseBuilder<'object', string> {
    type: 'object';
    addBody(body: IJsBodyValue): IVarObjectBuilder;
    addTypeDef(typeDefinition: IType): IVarObjectBuilder;
    setLevel(level: 'const' | 'let' | 'var'): IVarObjectBuilder;
    markExport(): IVarObjectBuilder;
}

declare type JoinType<K extends 'union' | 'intersection', T> = {
    [Key in keyof T]: {
        joinType: K;
        type: T[Key];
    };
};

/**
 * References the keyof property for a type/interface
 * @param builder The type/interface to reference
 */
export declare function keyOfExtractor<Type extends IBaseBuilderTypes, Name extends string>(builder: IBaseBuilder<Type, Name>): IRawTypePropertyType;

export declare function mapObject<T, K>(obj: Record<string, T>, transform: (value: T, key: string) => K): Record<string, K>;

export declare function nullType(): INullType;

declare type NumberLiterals<T extends Readonly<number[]>> = {
    [P in keyof T]: T[P] extends number ? INumberLiteralType<T[P]> : never;
};

export declare function numberTuple<T extends Readonly<number[]>>(...type: T): ITupleType<NumberLiterals<T>>;

export declare function numberType(): INumberType;

export declare function numberType<T extends number[]>(...value: T): IUnionType<NumberLiterals<T>>;

export declare function objectType<T extends IBodyType>(type: T, ...extract: ITypePropertyType[]): IObjectType<T>;

export declare function objectValue(value: IJsBodyValue): IJsObjectValue;

declare type OutputModule<Inputs extends GetInputs = GetInputs, MappedBuilders extends ReadonlyArray<IBaseBuilder<'interface' | 'type', string>> = ReadonlyArray<IBaseBuilder<'interface' | 'type', string>>, StaticBuilders extends ReadonlyArray<IBaseBuilder<'interface' | 'type', string>> = ReadonlyArray<IBaseBuilder<'interface' | 'type', string>>, Unpromise extends boolean = false> = {
    getStaticExports?: GetStaticExports<StaticBuilders>;
    getPath?: string;
    getMappedExports?: GetMappedExports<Inputs, MappedBuilders, Unpromise>;
    getInputs?: Inputs;
};

export declare function primitiveValue(value: string | number | boolean): IJsStringValue | IJsNumberValue | IJsBooleanValue;

export declare type ProjectConfig = {
    outDir?: string;
    projectDir?: string;
};

declare type Promiseable<T> = T | Promise<T>;

export declare function rawType(value: string): IRawIdentifierType;

export declare function readonly<T extends IType>(type: T): IDecorationType<[T]>;

declare type StringLiterals<T extends Readonly<string[]>> = {
    [P in keyof T]: T[P] extends string ? IStringLiteralType<T[P]> : never;
};

export declare function stringTuple<T extends Readonly<string[]>>(...type: T): ITupleType<StringLiterals<T>>;

export declare function stringType(): IStringType;

export declare function stringType<T extends string[]>(...value: T): IUnionType<StringLiterals<T>>;

export declare function toObjectType<T extends any[]>(arr: T | undefined, transform: (value: T[number]) => {
    key: string;
    value: IBodyType[keyof IBodyType];
}): IObjectType;

declare type TSCGenInputs<T extends GetInputs> = Unpromise<ReturnType<T>>[number]['data'];

export declare function tupleType<T extends readonly IType<unknown>[]>(type: T, ...extract: ITypePropertyType[]): ITupleType<T>;

export declare function typeDefBuilder<Name extends string, Generics extends Readonly<IGenericValue<string, IGenericOptions>[]> = [], JoinedTypes extends ReadonlyArray<{
    type: IType;
    joinType: 'union' | 'intersection';
}> = [], Exported extends boolean = false>(name: Name, defaultOptions?: {
    generics?: Generics;
    export: boolean;
    types?: JoinedTypes;
}): ITypeDefBuilder<Name, Generics, JoinedTypes, Exported>;

export declare function undefinedType(): IUndefinedType;

export declare function unionType<T extends ReadonlyArray<IType>>(types: T, ...extract: ITypePropertyType[]): IUnionType<T>;

declare type Unpromise<T> = T extends Promise<infer U> ? U : never;

export declare const varObjectBuilder: (name: string, defaultValue?: {
    body: IJsBodyValue;
    decorate: 'const' | 'let' | 'var';
    export: boolean;
    type?: IType;
}) => IVarObjectBuilder;

export { }
