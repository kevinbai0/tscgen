import { IBaseBuilder, IBaseBuilderTypes } from '../core/builders/baseBuilder';
import {
  IJsArrayValue,
  IJsBodyValue,
  IJsIdentifierValue,
  IJsNumberValue,
  IJsObjectValue,
  IJsStringValue,
  IJsBooleanValue,
  IJsValue,
} from './types';

export function primitiveValue(
  value: string | number | boolean
): IJsStringValue | IJsNumberValue | IJsBooleanValue {
  if (typeof value === 'string') {
    return {
      type: 'string',
      value,
    };
  }
  if (typeof value === 'boolean') {
    return {
      type: 'boolean',
      value,
    };
  }
  return {
    type: 'number',
    value,
  };
}

export function arrayValue(...values: IJsValue[]): IJsArrayValue {
  return {
    type: 'array',
    value: values,
  };
}

export function objectValue(value: IJsBodyValue): IJsObjectValue {
  return {
    type: 'object',
    value,
  };
}

/**
 *
 * @param builder The name of the interace/type
 * @param extract Properties to extract for the identifier (eg: ITest[number][string])
 */
export function identifierValue<
  Type extends IBaseBuilderTypes,
  Name extends string
>(builder: IBaseBuilder<Type, Name>): IJsIdentifierValue {
  return {
    type: 'identifier',
    value: builder.varName,
  };
}
