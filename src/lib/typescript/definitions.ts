import { IBaseBuilder, IBaseBuilderTypes } from '../core/builders/baseBuilder';
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
  IBooleanLiteralType,
  IStringLiteralType,
  INumberLiteralType,
  IStringType,
  INumberType,
  IBooleanType,
  IUndefinedType,
  INullType,
  IRawIdentifierType,
  IGenericIdentifierType,
} from './types';

type StringLiterals<T extends Readonly<string[]>> = {
  [P in keyof T]: T[P] extends string ? IStringLiteralType<T[P]> : never;
};
type NumberLiterals<T extends Readonly<number[]>> = {
  [P in keyof T]: T[P] extends number ? INumberLiteralType<T[P]> : never;
};
type BooleanLiterals<T extends Readonly<boolean[]>> = {
  [P in keyof T]: T[P] extends boolean ? IBooleanLiteralType<T[P]> : never;
};

export function stringType(): IStringType;
export function stringType<T extends string[]>(
  ...value: T
): IUnionType<StringLiterals<T>>;
export function stringType<T extends Readonly<string[]>>(
  ...value: T
): IStringType | IUnionType<StringLiterals<T>> {
  if (!value.length) {
    return {
      type: 'string',
    };
  }

  return {
    type: 'union',
    definition: ((value.length === 1
      ? [
          {
            type: 'string_literal',
            definition: value[0],
          },
        ]
      : value.map((val) => stringType(val))) as unknown) as StringLiterals<T>,
  };
}

export function numberType(): INumberType;
export function numberType<T extends number[]>(
  ...value: T
): IUnionType<NumberLiterals<T>>;
export function numberType<T extends Readonly<number[]>>(
  ...value: T
): INumberType | IUnionType<NumberLiterals<T>> {
  if (!value.length) {
    return {
      type: 'number',
    };
  }

  return {
    type: 'union',
    definition: ((value.length === 1
      ? ([
          {
            type: 'number_literal',
            definition: value[0],
          },
        ] as const)
      : value.map((val) => numberTuple(val))) as unknown) as NumberLiterals<T>,
  };
}
export function booleanType(): IBooleanType;
export function booleanType<T extends boolean[]>(
  ...value: T
): IUnionType<BooleanLiterals<T>>;
export function booleanType<T extends Readonly<boolean[]>>(
  ...value: T
): IBooleanType | IUnionType<BooleanLiterals<T>> {
  if (!value.length) {
    return {
      type: 'boolean',
    };
  }

  return {
    type: 'union',
    definition: ((value.length === 1
      ? [
          {
            type: 'boolean_literal',
            definition: value[0],
          },
        ]
      : value.map((val) => booleanType(val))) as unknown) as BooleanLiterals<T>,
  };
}
export function undefinedType(): IUndefinedType {
  return {
    type: 'undefined',
  };
}
export function nullType(): INullType {
  return {
    type: 'null',
  };
}

export function unionType<T extends ReadonlyArray<IType>>(
  types: T,
  ...extract: ITypePropertyType[]
): IUnionType<T> {
  return {
    type: 'union',
    definition: types,
    extract,
  };
}

export function arrayType<T extends IType>(
  type: T,
  ...extract: ITypePropertyType[]
): IArrayType<T> {
  return {
    type: 'array',
    definition: type,
    extract,
  };
}

export function objectType<T extends IBodyType>(
  type: T,
  ...extract: ITypePropertyType[]
): IObjectType<T> {
  return {
    type: 'object',
    definition: type,
    extract,
  };
}

export function tupleType<T extends readonly IType<unknown>[]>(
  type: T,
  ...extract: ITypePropertyType[]
): ITupleType<T> {
  return {
    type: 'tuple',
    definition: type,
    extract,
  };
}

export function stringTuple<T extends Readonly<string[]>>(
  ...type: T
): ITupleType<StringLiterals<T>> {
  return {
    type: 'tuple',
    definition: (type.map((val) =>
      stringType(val)
    ) as unknown) as StringLiterals<T>,
  };
}

export function numberTuple<T extends Readonly<number[]>>(
  ...type: T
): ITupleType<NumberLiterals<T>> {
  return {
    type: 'tuple',
    definition: ((type.map((val) =>
      numberType(val)
    ) as unknown) as unknown) as NumberLiterals<T>,
  };
}

export function booleanTuple<T extends Readonly<boolean[]>>(
  ...type: T
): ITupleType<BooleanLiterals<T>> {
  return {
    type: 'tuple',
    definition: (type.map((val) =>
      booleanType(val)
    ) as unknown) as BooleanLiterals<T>,
  };
}

/**
 *
 * @param builder The name of the interace/type
 * @param extract Properties to extract for the identifier (eg: ITest[number][string])
 */
export function identifierType<
  T extends IBaseBuilder<'type' | 'interface', string>
>(builder: T, ...extract: ITypePropertyType[]): IIdentifierType {
  return {
    type: 'identifier',
    definition: builder,
    extract,
  };
}
export function rawType(value: string): IRawIdentifierType {
  return {
    type: 'raw_identifier',
    definition: value,
  };
}

export function genericType<T extends string>(
  value: T
): IGenericIdentifierType<T> {
  return {
    type: 'generic_identifier',
    definition: value,
  };
}

export function readonly<T extends IType>(type: T): IDecorationType<[T]> {
  return {
    type: 'decoration',
    definition: [type],
    decorate: (value) => `Readonly<${value}>`,
  };
}

export function extract<
  T extends IType,
  K extends Readonly<IType[]>,
  U extends IUnionType<K>
>(type: T, union: U): IDecorationType<[T, U]> {
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
export function keyOfExtractor<
  Type extends IBaseBuilderTypes,
  Name extends string
>(builder: IBaseBuilder<Type, Name>): IRawTypePropertyType {
  return {
    type: 'raw_property_type',
    definition: `keyof ${builder.varName}`,
  };
}
