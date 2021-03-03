import { IGenericValue, IType } from '../types';
import { writeGeneric, writeType } from '../write';
import { IBaseBuilder } from './types';

interface ITypeDefBuilder extends IBaseBuilder {
  type: 'type';
  addUnion(...type: IType[]): ITypeDefBuilder;
  addIntersection(...type: IType[]): ITypeDefBuilder;
  addGenerics(...generics: IGenericValue[]): ITypeDefBuilder;
  markExport(): ITypeDefBuilder;
}

export function typeDefBuilder(
  name: string,
  defaultOptions: {
    generics: IGenericValue[];
    export: boolean;
    types: {
      type: IType;
      joinType: 'union' | 'intersection';
    }[];
  } = {
    generics: [],
    export: false,
    types: [],
  }
): ITypeDefBuilder {
  function build(): string {
    const genericsStr = writeGeneric(defaultOptions.generics);
    const types = defaultOptions.types.reduce((acc, pair, i) => {
      if (i === 0) {
        return writeType(pair.type);
      }
      return `${acc} ${pair.joinType === 'union' ? '|' : '&'} ${writeType(
        pair.type
      )}`;
    }, '');
    return `${
      defaultOptions.export ? 'export ' : ''
    }type ${name}${genericsStr} = ${types};`;
  }

  function newBuilder(joinType: 'union' | 'intersection') {
    return (...types: IType[]) =>
      typeDefBuilder(name, {
        ...defaultOptions,
        types: [
          ...defaultOptions.types,
          ...types.map((type) => ({
            type: type,
            joinType: joinType,
          })),
        ],
      });
  }

  return {
    type: 'type',
    addGenerics: (...generics: IGenericValue[]) =>
      typeDefBuilder(name, {
        ...defaultOptions,
        generics: [...defaultOptions.generics, ...generics],
      }),
    addUnion: newBuilder('union'),
    addIntersection: newBuilder('intersection'),
    toString() {
      return build();
    },
    get varName() {
      return name;
    },
    markExport: () =>
      typeDefBuilder(name, {
        ...defaultOptions,
        export: true,
      }),
  };
}
