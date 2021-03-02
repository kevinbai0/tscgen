import { IGenericValue, IType } from '../types';
import { writeGeneric, writeType } from '../write';
import { IBaseBuilder } from './types';

interface ITypeDefBuilder extends IBaseBuilder {
  type: 'type';
  addUnion(type: IType): ITypeDefBuilder;
  addIntersection(type: IType): ITypeDefBuilder;
  addGenerics(...generics: IGenericValue[]): ITypeDefBuilder;
}

export function typeDefBuilder(
  name: string,
  defaultOptions: {
    generics: IGenericValue[];
    types: {
      type: IType;
      joinType: 'union' | 'intersection';
    }[];
  } = {
    generics: [],
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
    return `type ${name}${genericsStr} = ${types};`;
  }

  function newBuilder(joinType: 'union' | 'intersection') {
    return (type: IType) =>
      typeDefBuilder(name, {
        ...defaultOptions,
        types: [
          ...defaultOptions.types,
          {
            type: type,
            joinType: joinType,
          },
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
  };
}
