import { writeGeneric, writeType } from '../../typescript/write';
import { IGenericOptions, IGenericValue, IType } from '../../typescript/types';
import { IEntityBuilder } from './entityBuilder';

type JoinType<K extends 'union' | 'intersection', T> = {
  [Key in keyof T]: {
    joinType: K;
    type: T[Key];
  };
};

export type IGenericTypeDefBuilder = ITypeDefBuilder<
  string,
  ReadonlyArray<IGenericValue<string, IGenericOptions | undefined>>,
  ReadonlyArray<{
    type: IType;
    joinType: 'union' | 'intersection';
  }>,
  boolean
>;

export interface ITypeDefBuilder<
  Name extends string,
  Generics extends Readonly<IGenericValue<string, IGenericOptions>[]>,
  JoinedTypes extends ReadonlyArray<{
    type: IType;
    joinType: 'union' | 'intersection';
  }>,
  Exported extends boolean
> extends IEntityBuilder<'type', Name> {
  type: 'type';
  addUnion<T extends ReadonlyArray<IType>>(
    ...type: T
  ): ITypeDefBuilder<
    Name,
    Generics,
    [...JoinedTypes, ...JoinType<'union', T>],
    Exported
  >;
  addIntersection<T extends ReadonlyArray<IType>>(
    ...type: IType[]
  ): ITypeDefBuilder<
    Name,
    Generics,
    [...JoinedTypes, ...JoinType<'intersection', T>],
    Exported
  >;
  addGeneric<
    N extends string,
    Options extends IGenericOptions = {},
    T extends Readonly<IGenericValue<N, Options>> = Readonly<
      IGenericValue<N, Options>
    >
  >(
    name: N,
    options?: Options
  ): ITypeDefBuilder<Name, [...Generics, T], JoinedTypes, Exported>;
  markExport(): ITypeDefBuilder<Name, Generics, JoinedTypes, Exported>;
}

export function typeDefBuilder<
  Name extends string,
  Generics extends Readonly<IGenericValue<string, IGenericOptions>[]> = [],
  JoinedTypes extends ReadonlyArray<{
    type: IType;
    joinType: 'union' | 'intersection';
  }> = [],
  Exported extends boolean = false
>(
  name: Name,
  defaultOptions: {
    generics?: Generics;
    export: boolean;
    types?: JoinedTypes;
  } = {
    export: false,
  }
): ITypeDefBuilder<Name, Generics, JoinedTypes, Exported> {
  function build(): string {
    const genericsStr = writeGeneric(defaultOptions.generics);
    const types =
      defaultOptions.types?.reduce((acc, pair, i) => {
        if (i === 0) {
          return writeType(pair.type);
        }
        return `${acc} ${pair.joinType === 'union' ? '|' : '&'} ${writeType(
          pair.type
        )}`;
      }, '') ?? 'never';
    return `${
      defaultOptions.export ? 'export ' : ''
    }type ${name}${genericsStr} = ${types};`;
  }

  function newBuilder(joinType: 'union' | 'intersection') {
    return <T extends ReadonlyArray<IType>>(...types: T) =>
      typeDefBuilder(name, {
        ...defaultOptions,
        types: [
          ...(defaultOptions.types ?? []),
          ...types.map((type) => ({
            type: type,
            joinType: joinType,
          })),
        ],
      });
  }

  return {
    type: 'type',
    addGeneric<
      N extends string,
      Options extends IGenericOptions,
      T extends IGenericValue<N, Options>
    >(genericName: N, options?: Options) {
      return typeDefBuilder(name, {
        ...defaultOptions,
        generics: [
          ...(defaultOptions.generics ?? []),
          { name: genericName, options },
        ] as ReadonlyArray<IGenericValue<N, Options>>,
      }) as ITypeDefBuilder<Name, [...Generics, T], JoinedTypes, Exported>;
    },
    addUnion: newBuilder('union'),
    addIntersection: newBuilder('intersection'),
    toString() {
      return build();
    },
    get varName() {
      return name as Name;
    },
    markExport: () =>
      typeDefBuilder(name, {
        ...defaultOptions,
        export: true,
      }),
  };
}
