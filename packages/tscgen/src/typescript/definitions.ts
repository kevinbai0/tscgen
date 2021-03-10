import {
  IEntityBuilder,
  IEntityBuilderTypes,
} from '../core/builders/entityBuilder';
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
  ILazyType,
  IIntersectionType,
} from './types';

/**
 * Helper type to convert string array into array of {@link IStringLiteralType}
 */
export type StringLiterals<T extends Readonly<string[]>> = {
  [P in keyof T]: T[P] extends string ? IStringLiteralType<T[P]> : never;
};

/**
 * Helper type to convert number array into array of {@link INumberLiteralType}
 */
export type NumberLiterals<T extends Readonly<number[]>> = {
  [P in keyof T]: T[P] extends number ? INumberLiteralType<T[P]> : never;
};

/**
 * Helper type to convert boolean array into array of {@link IBooleanLiteralType}
 */
export type BooleanLiterals<T extends Readonly<boolean[]>> = {
  [P in keyof T]: T[P] extends boolean ? IBooleanLiteralType<T[P]> : never;
};

/**
 * Create the `string` type
 * @public
 */
export function stringType(): IStringType;
/**
 * Create a union of string literals (i.e. `'hello' | 'world'`)
 * @param value - `...string[]` A list of string literals to parse
 * @public
 */
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

/**
 * Create the `number` type
 * @public
 */
export function numberType(): INumberType;
/**
 * Create a union of number literal (i.e. `1 | 2 | 3`)
 * @param value - `...number[]` A list of number literals
 * @public
 */
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

/**
 * Create the `boolean` type
 * @public
 */
export function booleanType(): IBooleanType;
/**
 * Create a union of boolean literals (i.e. `true | false`)
 * @param value - `...boolean[]` A list of number literals
 * @public
 */
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

/**
 * Create the `undefined` type
 * @public
 */
export function undefinedType(): IUndefinedType {
  return {
    type: 'undefined',
  };
}

/**
 * Create the `null` type
 * @public
 */
export function nullType(): INullType {
  return {
    type: 'null',
  };
}

/**
 * Create a union type (i.e `{ value: 1 } | { value: 2 }`)
 * @param types - variadic array of {@link IType}
 * @returns
 * @public
 */
export function unionType<T extends ReadonlyArray<IType>>(
  ...types: T
): IUnionType<T> {
  return {
    type: 'union',
    definition: types,
  };
}

/**
 * Create an intersection type (i.e. `{ value: number } & { sample: string }`)
 * @param types - variadic array of {@link IType}
 * @returns
 * @public
 */
export function intersectionType<T extends ReadonlyArray<IType>>(
  ...types: T
): IIntersectionType<T> {
  return {
    type: 'intersection',
    definition: types,
  };
}

/**
 * Creates an array type (i.e. `Array<string>`)
 * @param type - {@link IType}
 * @returns
 * @public
 */
export function arrayType<T extends IType>(type: T): IArrayType<T> {
  return {
    type: 'array',
    definition: type,
  };
}

/**
 * Creates an object type - more specifically create a strongly typed `Record<string, unknown>`
 * @param type - {@link IBodyType}
 * @returns
 * @public
 */
export function objectType<T extends IBodyType>(type: T): IObjectType<T> {
  return {
    type: 'object',
    definition: type,
  };
}

/**
 * Create a tuple type (i.e. `[string, number]`)
 * @param type - variadic array of {@link IType}
 * @returns
 * @public
 */
export function tupleType<T extends readonly IType<unknown>[]>(
  ...type: T
): ITupleType<T> {
  return {
    type: 'tuple',
    definition: type,
  };
}

/**
 * Create a tuple of string literal types (i.e. ['hello', 'world'])
 * @param type - Variadic array of `ReadonlyArray<string>`
 * @returns
 * @public
 */
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

/**
 * Create a tuple of number literal types (i.e. [1, 2, 3])
 * @param type - Variadic array of `ReadonlyArray<number>`
 * @returns
 * @public
 */
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

/**
 * Create a tuple of boolean literal types (i.e. [true, false, false])
 * @param type - Variadic array of `ReadonlyArray<boolean>`
 * @returns
 * @public
 */
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
 * Creates a lazy type to be computed only when written
 * @param value - callback to compute the lazy value - returns a {@link IType}
 * @returns
 * @public
 */
export function lazyType<T extends IType>(value: () => T): ILazyType<T> {
  return {
    type: 'lazy_type',
    definition: value,
  };
}

/**
 * Create an identifier type from an {@link IEntityBuilder}
 * @param builder - The name of the interace/type
 * @param extract - Properties to extract for the identifier (eg: `ITest[number][string]`)
 * @returns
 * @public
 */
export function identifierType<
  T extends IEntityBuilder<IEntityBuilderTypes, string>
>(builder: T, ...extract: ITypePropertyType[]): IIdentifierType {
  return {
    type: 'identifier',
    definition: builder,
    extract,
  };
}

/**
 * Inject any value as a type (e.g `[Key in keyof T]`)
 * @param value - The unmodified `string` to inject
 * @returns
 * @public
 */
export function rawType(value: string): IRawIdentifierType {
  return {
    type: 'raw_identifier',
    definition: value,
  };
}

/**
 * Create a reference to a generic value in the {@link IInterfaceBuilder} or {@link ITypeDefBuilder}
 * @param value - `string` that represents the Generic Identifier
 * @returns
 */
export function genericType<T extends string>(
  value: T
): IGenericIdentifierType<T> {
  return {
    type: 'generic_identifier',
    definition: value,
  };
}

/**
 * Mark a type as readonly (i.e. `Readonly<string>`)
 * @param type - {@link IType}
 * @returns
 * @public
 */
export function readonly<T extends IType>(type: T): IDecorationType<[T]> {
  return {
    type: 'decoration',
    definition: [type],
    decorate: (value) => `Readonly<${value}>`,
  };
}

/**
 * Use the `Extract` selector (i.e. `Extract<SomeType, { name: string }>`)
 * @param type - {@link IType}
 * @param union - {@link IUnionType} to form the extract query
 * @returns
 * @public
 */
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
 * References the `keyof` property for a type/interface
 * @param builder - The type/interface to reference
 */
export function keyOfExtractor<
  Type extends IEntityBuilderTypes,
  Name extends string
>(builder: IEntityBuilder<Type, Name>): IRawTypePropertyType {
  return {
    type: 'raw_property_type',
    definition: `keyof ${builder.varName}`,
  };
}
