import { writeGeneric, writeType } from '../typescript/write';
import {
  IJsBodyValue,
  IJsNumberValue,
  IJsStringValue,
  IJsBooleanValue,
  IJsValue,
  IJsArrayValue,
  IJsObjectValue,
  IJsIdentifierValue,
  IJsArrowFnDefinitionValue,
  IJsFunctionParamValue,
  IUndefinedValue,
  INullValue,
  IJsFunctionCallValue,
  IJsProperties,
} from './types';

export function writeJsNumber(value: IJsNumberValue): string {
  return `${value}`;
}

export function writeJsString(value: IJsStringValue): string {
  return `\`${value}\``;
}

export function writeJsBoolean(value: IJsBooleanValue): string {
  return `${value}`;
}

export function writeUndefinedValue(value: IUndefinedValue): string {
  return `${value.type}`;
}

export function writeNullValue(value: INullValue): string {
  return `${value.type}`;
}

export function writeJsObject(value: IJsObjectValue): string {
  return `{${writeJsBody(value.value)}}`;
}

export function writeJsArray(value: IJsArrayValue): string {
  return `[${value.map(writeJsValue).join(',')}]`;
}

export function writeJsIdentifier(value: IJsIdentifierValue): string {
  return value.value;
}

export function writeJsBody(body: IJsBodyValue): string {
  return Object.entries(body)
    .map(([key, value]) => `${key}: ${writeJsValue(value)}`)
    .join(',');
}

export function writeJsProperties(value: IJsProperties): string {
  return `${writeJsValue(value.value)}${value.properties
    .map(writeJsValue)
    .map((val) => `[${val}]`)
    .join('')}`;
}

/**
 *
 * @param value - serializes an {@link IJsValue}
 * @returns
 * @internal
 */
export function writeJsValue(value: IJsValue): string {
  function handleObject(value: Exclude<IJsValue, string | number | boolean>) {
    if (Array.isArray(value)) {
      return writeJsArray(value);
    }
    switch (value.type) {
      case 'identifier':
        return writeJsIdentifier(value);
      case 'arrow_function':
        return writeArrowFunction(value);
      case 'function_call':
        return writeCallFunction(value);
      case 'value_properties':
        return writeJsProperties(value);
      case 'object':
        return writeJsObject(value);
      case 'undefined':
        return writeUndefinedValue(value);
      case 'null':
        return writeNullValue(value);
    }
  }
  switch (typeof value) {
    case 'string':
      return writeJsString(value);
    case 'number':
      return writeJsNumber(value);
    case 'boolean':
      return writeJsBoolean(value);
    default:
      return handleObject(value);
  }
}

export function writeFnParam(value: IJsFunctionParamValue): string {
  return `${value.value.key}:${writeType(value.value.type)}`;
}
export function writeArrowFunction(value: IJsArrowFnDefinitionValue): string {
  const returnType = value.value.returnType
    ? `: ${writeType(value.value.returnType)}`
    : '';
  const generics = value.value.generic?.length
    ? `<${writeGeneric(value.value.generic)}>`
    : '';
  return `${generics}(${value.value.params
    .map(writeFnParam)
    .join(',')})${returnType} => ${writeJsValue(value.value.returnValue)}`;
}

export function writeCallFunction(value: IJsFunctionCallValue): string {
  const paramValues = value.params.map(writeJsValue).join(',');
  const genericCalls = value.genericCalls
    ? `<${value.genericCalls.map(writeType).join(',')}>`
    : '';
  return value.value.type === 'identifier'
    ? `${value.value.value}${genericCalls}(${paramValues})`
    : `(${writeArrowFunction(value.value)})${genericCalls}(${paramValues})`;
}
