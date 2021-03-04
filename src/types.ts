export type IGenericOptions =
  | {
      extendsValue?: IType;
      defaultValue?: IType;
    }
  | undefined;
export type IGenericValue<
  Name extends string = string,
  Options extends IGenericOptions = undefined
> = {
  name: Name;
  options: Options;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IType<T extends any = any> =
  | IStringType
  | INumberType
  | IBooleanType
  | IUndefinedType
  | INullType
  | IIdentifierType
  | IArrayType<T extends IType ? T : IType>
  | IObjectType<T extends IBodyType ? T : IBodyType>
  | IUnionType<T extends Readonly<IType[]> ? T : Readonly<IType[]>>
  | IStringLiteralType<T extends string ? T : string>
  | INumberLiteralType<T extends number ? T : number>
  | IBooleanLiteralType<T extends boolean ? T : boolean>
  | ITupleType<T extends Readonly<IType[]> ? T : Readonly<IType[]>>
  | IDecorationType<T extends Readonly<IType[]> ? T : Readonly<IType[]>>;

export interface IRawTypePropertyType {
  type: 'raw_property_type';
  definition: string;
}

export type ITypePropertyType =
  | IStringType
  | INumberType
  | IBooleanType
  | IStringLiteralType
  | INumberLiteralType
  | IBooleanLiteralType
  | IIdentifierType
  | IRawTypePropertyType;

export interface IDecorationType<
  T extends Readonly<IType[]> = Readonly<IType[]>
> {
  type: 'decoration';
  definition: T;
  decorate: (...value: string[]) => string;
}

export interface IStringType {
  type: 'string';
}
export interface INumberType {
  type: 'number';
}
export interface IBooleanType {
  type: 'boolean';
}
export interface IUndefinedType {
  type: 'undefined';
}
export interface INullType {
  type: 'null';
}

export interface IIdentifierType {
  type: 'identifier';
  definition: string;
  extract?: ITypePropertyType[];
}

export interface IArrayType<T extends IType = IType> {
  type: 'array';
  definition: T;
  extract?: ITypePropertyType[];
}

export interface ITupleType<
  T extends ReadonlyArray<IType> = ReadonlyArray<IType>
> {
  type: 'tuple';
  definition: T;
  extract?: ITypePropertyType[];
}

export interface IBooleanLiteralType<T extends boolean = boolean> {
  type: 'boolean_literal';
  definition: T;
}

export interface IStringLiteralType<T extends string = string> {
  type: 'string_literal';
  definition: T;
}

export interface INumberLiteralType<T extends number = number> {
  type: 'number_literal';
  definition: T;
}

export interface IUnionType<T extends Readonly<IType[]> = []> {
  type: 'union';
  definition: T;
  extract?: ITypePropertyType[];
}

export type IObjectType<T extends IBodyType = IBodyType> = {
  type: 'object';
  definition: T;
  extract?: ITypePropertyType[];
};

export interface IBodyType {
  [key: string]: IType | [IType, boolean];
}

export type IJsValue =
  | IJsStringValue
  | IJsBooleanValue
  | IJsNumberValue
  | IJsArrayValue
  | IJsObjectValue
  | IJsIdentifierValue;

export interface IJsIdentifierValue {
  type: 'identifier';
  value: string;
}

export interface IJsStringValue {
  type: 'string';
  value: string;
}

export interface IJsNumberValue {
  type: 'number';
  value: number;
}

export interface IJsBooleanValue {
  type: 'boolean';
  value: boolean;
}

export interface IJsArrayValue {
  type: 'array';
  value: IJsValue[];
}

export interface IJsObjectValue {
  type: 'object';
  value: IJsBodyValue;
}

export interface IJsBodyValue {
  [key: string]: IJsValue;
}
