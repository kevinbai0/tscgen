import { IEntityBuilder, IEntityBuilderTypes } from '../core/builders/entityBuilder';
import { IArrayType, IBodyType, IIdentifierType, IObjectType, ITupleType, IType, IUnionType, ITypePropertyType, IRawTypePropertyType, IDecorationType, IBooleanLiteralType, IStringLiteralType, INumberLiteralType, IStringType, INumberType, IBooleanType, IUndefinedType, INullType, IRawIdentifierType, IGenericIdentifierType, ILazyType, IIntersectionType } from './types';
declare type StringLiterals<T extends Readonly<string[]>> = {
    [P in keyof T]: T[P] extends string ? IStringLiteralType<T[P]> : never;
};
declare type NumberLiterals<T extends Readonly<number[]>> = {
    [P in keyof T]: T[P] extends number ? INumberLiteralType<T[P]> : never;
};
declare type BooleanLiterals<T extends Readonly<boolean[]>> = {
    [P in keyof T]: T[P] extends boolean ? IBooleanLiteralType<T[P]> : never;
};
export declare function stringType(): IStringType;
export declare function stringType<T extends string[]>(...value: T): IUnionType<StringLiterals<T>>;
export declare function numberType(): INumberType;
export declare function numberType<T extends number[]>(...value: T): IUnionType<NumberLiterals<T>>;
export declare function booleanType(): IBooleanType;
export declare function booleanType<T extends boolean[]>(...value: T): IUnionType<BooleanLiterals<T>>;
export declare function undefinedType(): IUndefinedType;
export declare function nullType(): INullType;
export declare function unionType<T extends ReadonlyArray<IType>>(types: T, ...extract: ITypePropertyType[]): IUnionType<T>;
export declare function intersectionType<T extends ReadonlyArray<IType>>(types: T, ...extract: ITypePropertyType[]): IIntersectionType<T>;
export declare function arrayType<T extends IType>(type: T, ...extract: ITypePropertyType[]): IArrayType<T>;
export declare function objectType<T extends IBodyType>(type: T, ...extract: ITypePropertyType[]): IObjectType<T>;
export declare function tupleType<T extends readonly IType<unknown>[]>(type: T, ...extract: ITypePropertyType[]): ITupleType<T>;
export declare function stringTuple<T extends Readonly<string[]>>(...type: T): ITupleType<StringLiterals<T>>;
export declare function lazyType<T extends IType>(value: () => T): ILazyType<T>;
export declare function numberTuple<T extends Readonly<number[]>>(...type: T): ITupleType<NumberLiterals<T>>;
export declare function booleanTuple<T extends Readonly<boolean[]>>(...type: T): ITupleType<BooleanLiterals<T>>;
/**
 *
 * @param builder The name of the interace/type
 * @param extract Properties to extract for the identifier (eg: ITest[number][string])
 */
export declare function identifierType<T extends IEntityBuilder<IEntityBuilderTypes, string>>(builder: T, ...extract: ITypePropertyType[]): IIdentifierType;
export declare function rawType(value: string): IRawIdentifierType;
export declare function genericType<T extends string>(value: T): IGenericIdentifierType<T>;
export declare function readonly<T extends IType>(type: T): IDecorationType<[T]>;
export declare function extract<T extends IType, K extends Readonly<IType[]>, U extends IUnionType<K>>(type: T, union: U): IDecorationType<[T, U]>;
/**
 * References the keyof property for a type/interface
 * @param builder The type/interface to reference
 */
export declare function keyOfExtractor<Type extends IEntityBuilderTypes, Name extends string>(builder: IEntityBuilder<Type, Name>): IRawTypePropertyType;
export {};
