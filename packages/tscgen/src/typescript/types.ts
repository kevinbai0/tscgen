import {
  IEntityBuilder,
  IEntityBuilderTypes,
} from '../core/builders/entityBuilder';

/**
 * The default value and extends clause of a generic type
 */
export type IGenericOptions =
  | {
      extendsValue?: IType;
      defaultValue?: IType;
    }
  | undefined;

/**
 * Represents a generic value with (i.e. `\<T extends string\>`)
 * @typeParam Name - The name of the generic (i.e. `T` or `S`)
 * @typeParam Options - specify default value / extends clause of the generic
 * @public
 */
export type IGenericValue<
  Name extends string = string,
  Options extends IGenericOptions = undefined
> = {
  name: Name;
  options: Options;
};

/**
 * Represents a Typescript type
 * @typeParam T - Type parameter for the type
 * @public
 */
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
  | IGenericPropertiesType<T extends IIdentifierType ? T : IIdentifierType>
  | ITypeProperties<T extends IType ? T : IType>
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

/**
 * Represents the `string` type
 * @public
 */
export interface IStringType {
  type: 'string';
}

/**
 * Represents the `number` type
 * @public
 */
export interface INumberType {
  type: 'number';
}

/**
 * Represents the `boolean` type
 * @public
 */
export interface IBooleanType {
  type: 'boolean';
}

/**
 * Represents the `undefined` type
 * @public
 */
export interface IUndefinedType {
  type: 'undefined';
}

/**
 * Represents the `null` type
 * @public
 */
export interface INullType {
  type: 'null';
}

/**
 * Represents a lazy type to be computed on write
 * @typeParam T - Any IType
 * @public
 */
export interface ILazyType<T extends IType> {
  type: 'lazy_type';
  definition: () => T;
}

/**
 * Represents an identifier type to be referenced
 * @typeParam T - the IEntityBuilder to be referenced
 * @public
 */
export interface IIdentifierType<
  T extends IEntityBuilder<IEntityBuilderTypes, string> = IEntityBuilder<
    IEntityBuilderTypes,
    string
  >
> {
  type: 'type_identifier';
  definition: T;
  extract?: ITypePropertyType[];
}

/**
 * Represents the `Array<T>` type
 * @typeParam T - the type of the array (Array<T>)
 * @public
 */
export interface IArrayType<T extends IType = IType> {
  type: 'array';
  definition: T;
  extract?: ITypePropertyType[];
}

/**
 * Represents a tuple type `[...T[]]`
 * @typeParam T - Tuple of the ITypes in the tuple type
 * @public
 */
export interface ITupleType<
  T extends ReadonlyArray<IType> = ReadonlyArray<IType>
> {
  type: 'tuple';
  definition: T;
  extract?: ITypePropertyType[];
}

/**
 * Represents a boolean literal `true` or `false`
 * @typeParam T - type of boolean
 * @public
 */
export interface IBooleanLiteralType<T extends boolean = boolean> {
  type: 'boolean_literal';
  definition: T;
}

/**
 * Represents a string literal such as `'hello'`
 * @typeParam T - type of string
 * @public
 */
export interface IStringLiteralType<T extends string = string> {
  type: 'string_literal';
  definition: T;
}

/**
 * Represents a number literal such as `42`
 * @typeParam T - type of boolean
 * @public
 */
export interface INumberLiteralType<T extends number = number> {
  type: 'number_literal';
  definition: T;
}

/**
 * Represents a union type (i.e. `A | B | C`)
 * @typeParam T - Array of types to union
 * @public
 */
export interface IUnionType<T extends Readonly<IType[]> = Readonly<IType[]>> {
  type: 'union';
  definition: T;
  extract?: ITypePropertyType[];
}

/**
 * Represents an intersection type (i.e. `A & B & C`)
 * @typeParam T - Array of types to intersect
 * @public
 */
export interface IIntersectionType<T extends Readonly<IType[]> = []> {
  type: 'intersection';
  definition: T;
  extract?: ITypePropertyType[];
}

/**
 * Represents a strongly typed object i.e. `{ name: string, value: 5 }`
 * @typeParam T - {@link IBodyType}
 * @public
 */
export type IObjectType<T extends IBodyType = IBodyType> = {
  type: 'object';
  definition: T;
  extract?: ITypePropertyType[];
};

/**
 * Any raw string to include that isn't supported (i.e. `Key extends string`)
 * @typeParam T - The string to inject raw
 * @public
 */
export type IRawIdentifierType = {
  type: 'raw_identifier';
  definition: string;
};

/**
 * Represents a generic type name (i.e. `<T>` or `<S>`)
 * @typeParam T - name of the generic identifier
 * @public
 */
export type IGenericIdentifierType<T extends string = string> = {
  type: 'generic_identifier';
  definition: T;
};

export interface IGenericPropertiesType<
  T extends IIdentifierType = IIdentifierType
> {
  type: 'generic_properties';
  definition: T;
  generics: ReadonlyArray<IType>;
}

export interface ITypeProperties<T extends IType = IType> {
  type: 'type_properties';
  definition: T;
  properties: ReadonlyArray<IType>;
}

/**
 * Body of object type, with keys being `string`, and values being `IType` or `[IType, boolean]` - where `[IType, false]` means it's not a required value
 * @public
 */
export interface IBodyType {
  [key: string]: IType | [IType, boolean];
}
