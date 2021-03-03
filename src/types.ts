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
  | ITupleType;

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

export interface IObjectType {
  type: 'object';
  definition: IBodyType;
  extract?: ITypePropertyType[];
}

export interface IBodyType {
  [key: string]: IType | [IType, boolean];
}
