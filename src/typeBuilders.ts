import { IBaseBuilder } from './builders/types';
import {
  IArrayType,
  IBodyType,
  IIdentifierType,
  INumberLiteralType,
  IObjectType,
  IStringLiteralType,
  ITupleType,
  IType,
  IUnionType,
} from './types';

export function buildLiteralType(
  value: string | number
): IStringLiteralType | INumberLiteralType {
  if (typeof value === 'string') {
    return {
      type: 'string_literal',
      definition: value,
    };
  }
  return {
    type: 'number_literal',
    definition: value,
  };
}

export function buildUnionType(...types: IType[]): IUnionType {
  return {
    type: 'union',
    definition: types,
  };
}

export function buildArrayType(type: IType): IArrayType {
  return {
    type: 'array',
    definition: type,
  };
}

export function buildObjectType(type: IBodyType): IObjectType {
  return {
    type: 'object',
    definition: type,
  };
}

export function buildLiteralUnionType(...lit: (string | number)[]): IUnionType {
  return {
    type: 'union',
    definition: lit.map(buildLiteralType),
  };
}

export function buildTupleType(...type: IType[]): ITupleType {
  return {
    type: 'tuple',
    definition: type,
  };
}

export function buildLiteralTupleType(
  ...type: (string | number)[]
): ITupleType {
  return {
    type: 'tuple',
    definition: type.map(buildLiteralType),
  };
}

export function buildIdentifierType(builder: IBaseBuilder): IIdentifierType {
  return {
    type: 'identifier',
    definition: builder.varName,
  };
}
