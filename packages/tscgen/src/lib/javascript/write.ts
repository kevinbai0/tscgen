import {
  IJsBodyValue,
  IJsNumberValue,
  IJsStringValue,
  IJsBooleanValue,
  IJsValue,
  IJsArrayValue,
  IJsObjectValue,
  IJsIdentifierValue,
} from './types';

export function writeJsNumber(value: IJsNumberValue): string {
  return `${value}`;
}

export function writeJsString(value: IJsStringValue): string {
  return `'${value}'`;
}

export function writeJsBoolean(value: IJsBooleanValue): string {
  return `${value}`;
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

export function writeJsValue(value: IJsValue): string {
  function handleObject(value: Exclude<IJsValue, string | number | boolean>) {
    if (Array.isArray(value)) {
      return writeJsArray(value);
    }
    if (value.type === 'identifier') {
      return writeJsIdentifier(value);
    }
    if (value.type === 'object') {
      return writeJsObject(value);
    }

    throw new Error(`Unexpected type ${value}`);
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
