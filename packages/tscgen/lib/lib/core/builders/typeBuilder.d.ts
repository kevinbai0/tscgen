import { IGenericOptions, IGenericValue, IType } from '../../typescript/types';
import { IEntityBuilder } from './entityBuilder';
declare type JoinType<K extends 'union' | 'intersection', T> = {
    [Key in keyof T]: {
        joinType: K;
        type: T[Key];
    };
};
export declare type IGenericTypeDefBuilder = ITypeDefBuilder<string, ReadonlyArray<IGenericValue<string, IGenericOptions | undefined>>, ReadonlyArray<{
    type: IType;
    joinType: 'union' | 'intersection';
}>, boolean>;
export interface ITypeDefBuilder<Name extends string, Generics extends Readonly<IGenericValue<string, IGenericOptions>[]>, JoinedTypes extends ReadonlyArray<{
    type: IType;
    joinType: 'union' | 'intersection';
}>, Exported extends boolean> extends IEntityBuilder<'type', Name> {
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
export declare function typeDefBuilder<Name extends string, Generics extends Readonly<IGenericValue<string, IGenericOptions>[]> = [], JoinedTypes extends ReadonlyArray<{
    type: IType;
    joinType: 'union' | 'intersection';
}> = [], Exported extends boolean = false>(name: Name, defaultOptions?: {
    generics?: Generics;
    export: boolean;
    types?: JoinedTypes;
}): ITypeDefBuilder<Name, Generics, JoinedTypes, Exported>;
export {};
