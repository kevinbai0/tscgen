import { IEntityBuilder } from '../lib/core/builders/entityBuilder';
import { IInterfaceBuilder } from '../lib/core/builders/interfaceBuilder';
import { IBodyType, IGenericOptions, IGenericValue, ITupleType, IObjectType, IStringLiteralType, IType, IUnionType, INumberLiteralType, IBooleanLiteralType, IArrayType, IBooleanType, IStringType, INumberType, IUndefinedType, INullType, IIdentifierType } from '../lib/typescript/types';
export declare type UseInterface<T extends IInterfaceBuilder<string, Readonly<IGenericValue<string, IGenericOptions | undefined>[]>, IBodyType, boolean, IIdentifierType<IEntityBuilder<'interface', string>> | undefined>, Generics extends [...IGenericValue[]] = []> = ExtractBody<T['body']>;
declare type KnownKeys<T> = {
    [K in keyof T]: T[K] extends never ? never : K;
}[keyof T];
declare type Clean<T> = {
    [Key in KnownKeys<T>]: T[Key];
};
declare type OptionalPropertyOf<T> = Exclude<{
    [K in keyof T]: T extends Record<K, T[K]> ? never : K;
}[keyof T], undefined>;
declare type Flatten<T> = {} & {
    [P in keyof T]: T[P];
};
declare type Merge<T1, T2, First = {
    [K in keyof T1]: K extends keyof T2 ? T1[K] | T2[K] : T1[K];
}, OptionalSecond = {
    [K in Exclude<OptionalPropertyOf<T2>, keyof T1>]+?: T2[K];
}, NonOptionalSecond = {
    [K in Exclude<keyof T2, keyof First | keyof OptionalSecond>]: T2[K];
}> = Flatten<First & OptionalSecond & NonOptionalSecond>;
declare type WriteOptionals<T extends IBodyType> = {
    [Key in keyof T]: T[Key] extends [IType, boolean] ? T[Key][1] extends false ? ExtractType<T[Key][0]> : never : never;
};
declare type WriteRequired<T extends IBodyType> = {
    [Key in keyof T]: T[Key] extends [IType, boolean] ? T[Key][1] extends true ? ExtractType<T[Key][0]> : never : T[Key] extends IType ? ExtractType<T[Key]> : never;
};
declare type ExtractBody<T extends IBodyType> = Merge<Partial<Clean<WriteOptionals<T>>>, Clean<WriteRequired<T>>>;
declare type ExtractUnionType<T extends IUnionType<ReadonlyArray<IType>>> = ExtractType<T['definition'][number]>;
declare type ExtractObjectType<T extends IObjectType> = ExtractBody<T['definition']>;
declare type ExtractArrayType<T extends IArrayType> = Array<ExtractType<T['definition']>>;
declare type TupleHelper<T> = {
    [Key in keyof T]: T[Key] extends IType ? ExtractType<T[Key]> : never;
};
declare type ExtractTupleType<T extends ITupleType> = TupleHelper<T['definition']>;
declare type ExtractType<T extends IType> = T extends IStringType ? string : T extends IBooleanType ? boolean : T extends INumberType ? number : T extends IUndefinedType ? undefined : T extends INullType ? null : T extends IStringLiteralType | INumberLiteralType | IBooleanLiteralType ? T['definition'] : T extends IUnionType<any> ? ExtractUnionType<T> : T extends IObjectType<any> ? ExtractObjectType<T> : T extends IArrayType<any> ? ExtractArrayType<T> : T extends ITupleType<any> ? ExtractTupleType<T> : never;
export {};
