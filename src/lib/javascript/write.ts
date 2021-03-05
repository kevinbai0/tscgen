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
  return `${value.value}`;
}

export function writeJsString(value: IJsStringValue): string {
  return `'${value.value}'`;
}

export function writeJsBoolean(value: IJsBooleanValue): string {
  return `${value.value}`;
}

export function writeJsObject(value: IJsObjectValue): string {
  return `{${writeJsBody(value.value)}}`;
}

export function writeJsArray(value: IJsArrayValue): string {
  return `[${value.value.map(writeJsValue).join(',')}]`;
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
  switch (value.type) {
    case 'string':
      return writeJsString(value);
    case 'number':
      return writeJsNumber(value);
    case 'boolean':
      return writeJsBoolean(value);
    case 'object':
      return writeJsObject(value);
    case 'array':
      return writeJsArray(value);
    case 'identifier':
      return writeJsIdentifier(value);
  }
}
