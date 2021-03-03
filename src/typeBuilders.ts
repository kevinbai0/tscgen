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
  ITypePropertyType,
  IRawTypePropertyType,
  IBooleanLiteralType,
} from './types';

export function literalType(
  value: string | number | boolean
): IStringLiteralType | INumberLiteralType | IBooleanLiteralType {
  if (typeof value === 'string') {
    return {
      type: 'string_literal',
      definition: value,
    };
  }
  if (typeof value === 'boolean') {
    return {
      type: 'boolean_literal',
      definition: value,
    };
  }
  return {
    type: 'number_literal',
    definition: value,
  };
}

export function unionType(
  types: IType[],
  ...extract: ITypePropertyType[]
): IUnionType {
  return {
    type: 'union',
    definition: types,
    extract,
  };
}

export function arrayType(
  type: IType,
  ...extract: ITypePropertyType[]
): IArrayType {
  return {
    type: 'array',
    definition: type,
    extract,
  };
}

export function objectType(
  type: IBodyType,
  ...extract: ITypePropertyType[]
): IObjectType {
  return {
    type: 'object',
    definition: type,
    extract,
  };
}

export function literalUnionType(...lit: (string | number)[]): IUnionType {
  return {
    type: 'union',
    definition: lit.map(literalType),
  };
}

export function tupleType(
  type: IType[],
  ...extract: ITypePropertyType[]
): ITupleType {
  return {
    type: 'tuple',
    definition: type,
    extract,
  };
}

/**
 *
 * @param type Builds a tuple of number/string
 */
export function literalTupleType(
  ...type: (string | number | boolean)[]
): ITupleType {
  return {
    type: 'tuple',
    definition: type.map(literalType),
  };
}

/**
 *
 * @param builder The name of the interace/type
 * @param extract Properties to extract for the identifier (eg: ITest[number][string])
 */
export function identifierType(
  builder: IBaseBuilder,
  ...extract: ITypePropertyType[]
): IIdentifierType {
  return {
    type: 'identifier',
    definition: builder.varName,
    extract,
  };
}

/**
 * References the keyof property for a type/interface
 * @param builder The type/interface to reference
 */
export function keyOfExtractor(builder: IBaseBuilder): IRawTypePropertyType {
  return {
    type: 'raw_property_type',
    definition: `keyof ${builder.varName}`,
  };
}
