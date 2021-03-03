export type IGenericValue = [
  name: string,
  options?: {
    extendsValue?: IType;
    defaultValue?: IType;
  }
];

export type IType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'undefined'
  | IIdentifierType
  | IArrayType
  | IObjectType
  | IUnionType
  | IStringLiteralType
  | INumberLiteralType
  | IBooleanLiteralType
  | ITupleType
  | IDecorationType;

export interface IRawTypePropertyType {
  type: 'raw_property_type';
  definition: string;
}

export type ITypePropertyType =
  | 'string'
  | 'number'
  | 'boolean'
  | IStringLiteralType
  | INumberLiteralType
  | IBooleanLiteralType
  | IIdentifierType
  | IRawTypePropertyType;

export interface IDecorationType {
  type: 'decoration';
  definition: [...IType[]];
  decorate: (...value: string[]) => string;
}

export interface IIdentifierType {
  type: 'identifier';
  definition: string;
  extract?: ITypePropertyType[];
}

export interface IArrayType {
  type: 'array';
  definition: IType;
  extract?: ITypePropertyType[];
}

export interface ITupleType {
  type: 'tuple';
  definition: IType[];
  extract?: ITypePropertyType[];
}

export interface IBooleanLiteralType {
  type: 'boolean_literal';
  definition: boolean;
}

export interface IStringLiteralType {
  type: 'string_literal';
  definition: string;
}

export interface INumberLiteralType {
  type: 'number_literal';
  definition: number;
}

export interface IUnionType {
  type: 'union';
  definition: Array<IType>;
  extract?: ITypePropertyType[];
}

export type IObjectType =
  | {
      type: 'object';
      definition: IBodyType;
      extract?: ITypePropertyType[];
    }
  | ({
      [key in Exclude<string, 'type'>]: IType;
    } & {
      type?: undefined;
    });

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
