import { IBaseBuilder } from './builders/types';
import {
  IArrayType,
  IBodyType,
  IIdentifierType,
  IObjectType,
  ITupleType,
  IType,
  IUnionType,
  ITypePropertyType,
  IRawTypePropertyType,
  IDecorationType,
} from './types';

export function stringType(): 'string';
export function stringType(...value: [string, ...string[]]): IUnionType;
export function stringType(...value: string[]): 'string' | IUnionType {
  if (!value.length) {
    return 'string';
  }

  return {
    type: 'union',
    definition:
      value.length === 1
        ? [
            {
              type: 'string_literal',
              definition: value[0],
            },
          ]
        : value.map((val) => stringType(val)),
  };
}
export function numberType(): 'number';
export function numberType(...value: [number, ...number[]]): IUnionType;
export function numberType(...value: number[]): 'number' | IUnionType {
  if (!value.length) {
    return 'number';
  }

  return {
    type: 'union',
    definition:
      value.length === 1
        ? [
            {
              type: 'number_literal',
              definition: value[0],
            },
          ]
        : value.map((val) => numberTuple(val)),
  };
}
export function booleanType(): 'boolean';
export function booleanType(...value: [boolean, ...boolean[]]): IUnionType;
export function booleanType(...value: boolean[]): 'boolean' | IUnionType {
  if (!value.length) {
    return 'boolean';
  }

  return {
    type: 'union',
    definition:
      value.length === 1
        ? [
            {
              type: 'boolean_literal',
              definition: value[0],
            },
          ]
        : value.map((val) => booleanType(val)),
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

export function stringTuple(...type: string[]): ITupleType {
  return {
    type: 'tuple',
    definition: type.map((val) => stringType(val)),
  };
}

export function numberTuple(...type: number[]): ITupleType {
  return {
    type: 'tuple',
    definition: type.map((val) => numberType(val)),
  };
}

export function booleanTuple(...type: boolean[]): ITupleType {
  return {
    type: 'tuple',
    definition: type.map((val) => booleanType(val)),
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
    definition: type.map((val) =>
      typeof val === 'string'
        ? stringType(val)
        : typeof val === 'number'
        ? numberType(val)
        : booleanType(val)
    ),
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

export function readonly(type: IType): IDecorationType {
  return {
    type: 'decoration',
    definition: [type],
    decorate: (value) => `Readonly<${value}>`,
  };
}

export function extract(type: IType, union: IUnionType): IDecorationType {
  return {
    type: 'decoration',
    definition: [type, union],
    decorate: (value, unionValue) => `Extract<${value}, ${unionValue}>`,
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
