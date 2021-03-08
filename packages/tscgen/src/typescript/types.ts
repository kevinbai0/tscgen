import {
  IEntityBuilder,
  IEntityBuilderTypes,
} from '../core/builders/entityBuilder';

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
  | IIdentifierType<
      T extends IEntityBuilder<'type' | 'interface', string>
        ? T
        : IEntityBuilder<'type' | 'interface', string>
    >
  | IArrayType<T extends IType ? T : IType>
  | IObjectType<T extends IBodyType ? T : IBodyType>
  | IUnionType<T extends Readonly<IType[]> ? T : Readonly<IType[]>>
  | IIntersectionType<T extends Readonly<IType[]> ? T : Readonly<IType[]>>
  | IStringLiteralType<T extends string ? T : string>
  | INumberLiteralType<T extends number ? T : number>
  | IBooleanLiteralType<T extends boolean ? T : boolean>
  | ITupleType<T extends Readonly<IType[]> ? T : Readonly<IType[]>>
  | IDecorationType<T extends Readonly<IType[]> ? T : Readonly<IType[]>>
  | IGenericIdentifierType<T extends string ? T : string>
  | IRawIdentifierType
  | ILazyType<T extends IType ? T : IType>;

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

export interface ILazyType<T extends IType> {
  type: 'lazy_type';
  definition: () => T;
}

export interface IIdentifierType<
  T extends IEntityBuilder<IEntityBuilderTypes, string> = IEntityBuilder<
    IEntityBuilderTypes,
    string
  >
> {
  type: 'identifier';
  definition: T;
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

export interface IIntersectionType<T extends Readonly<IType[]> = []> {
  type: 'intersection';
  definition: T;
  extract?: ITypePropertyType[];
}

export type IObjectType<T extends IBodyType = IBodyType> = {
  type: 'object';
  definition: T;
  extract?: ITypePropertyType[];
};

export type IRawIdentifierType = {
  type: 'raw_identifier';
  definition: string;
};

export type IGenericIdentifierType<T extends string = string> = {
  type: 'generic_identifier';
  definition: T;
};

export interface IBodyType {
  [key: string]: IType | [IType, boolean];
}
