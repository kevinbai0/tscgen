import { IEntityBuilder } from '../core/builders/entityBuilder';
import { IGenericInterfaceBuilder } from '../core/builders/interfaceBuilder';
import { IGenericTypeAliasBuilder } from '../core/builders/typeBuilder';
import {
  IBodyType,
  IObjectType,
  IStringLiteralType,
  IStringType,
  IType,
  IUndefinedType,
  IUnionType,
} from './types';

export function isTypeAlias(
  value: IEntityBuilder
): asserts value is IGenericTypeAliasBuilder {
  if (value.type !== 'type') {
    throw new Error();
  }
}

export function isInterface(
  value: IEntityBuilder
): asserts value is IGenericInterfaceBuilder {
  if (value.type !== 'interface') {
    throw new Error();
  }
}

export function hasBodyProperty<T extends string>(
  key: T
): (
  body: IBodyType
) => asserts body is IBodyType &
  {
    [key in T]: IBodyType[keyof IBodyType];
  } {
  return (body) => {
    if (!body[key]) {
      throw new Error();
    }
  };
}

export function isUndefinedType(
  value: IBodyType[keyof IBodyType]
): asserts value is IUndefinedType {
  if (Array.isArray(value) || value.type !== 'undefined') {
    throw new Error();
  }
}

export function isRequiredProperty(
  value: IBodyType[keyof IBodyType]
): asserts value is IType {
  if (Array.isArray(value)) {
    throw new Error();
  }
}

export function isObjectType(value: IType): asserts value is IObjectType {
  if (value.type !== 'object') {
    throw new Error();
  }
}

export function isStringType(value: IType): asserts value is IStringType {
  if (value.type !== 'string') {
    throw new Error();
  }
}

export function isSingleStringLiteral(
  value: IType
): asserts value is IUnionType<[IStringLiteralType]> {
  if (
    value.type === 'union' &&
    (value.definition as IType[]).length === 1 &&
    value.definition[0].type === 'string_literal'
  ) {
    return;
  }
  throw new Error();
}
