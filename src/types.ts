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
  | ITupleType;

export interface IIdentifierType {
  type: 'identifier';
  definition: string;
}

export interface IArrayType {
  type: 'array';
  definition: IType;
}

export interface ITupleType {
  type: 'tuple';
  definition: IType[];
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
}

export interface IObjectType {
  type: 'object';
  definition: IBodyType;
}

export interface IBodyType {
  [key: string]: IType | [IType, boolean];
}
