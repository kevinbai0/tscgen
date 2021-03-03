import {
  IGenericValue,
  IArrayType,
  IObjectType,
  INumberLiteralType,
  IStringLiteralType,
  IUnionType,
  IType,
  IBodyType,
  ITupleType,
  IIdentifierType,
  ITypePropertyType,
  IRawTypePropertyType,
  IBooleanLiteralType,
  IJsBodyValue,
  IJsNumberValue,
  IJsStringValue,
  IJsBooleanValue,
  IJsValue,
  IJsArrayValue,
  IJsObjectValue,
  IJsIdentifierValue,
  IDecorationType,
} from './types';

export function writeGeneric(values?: Array<IGenericValue>): string {
  if (!values?.length) {
    return '';
  }

  function writeValue(generic: IGenericValue): string {
    const extendsStr =
      generic.length === 2 && generic[1]?.extendsValue
        ? ` extends ${generic[1].extendsValue}`
        : '';
    const defaultStr =
      generic.length === 2 && generic[1]?.defaultValue
        ? ` = ${generic[1].defaultValue}`
        : '';
    return `${generic[0]}${extendsStr}${defaultStr}`;
  }
  return `<${values.map(writeValue)}>`;
}

function writeExtractedProperties(type: ITypePropertyType[] | undefined) {
  return type?.map(writeTypePropertyType) ?? '';
}

function writeArrayType(type: IArrayType): string {
  return `${writeType(type.definition)}[]${writeExtractedProperties(
    type.extract
  )}`;
}

function writeObjectType(type: IObjectType): string {
  if (type.type === 'object') {
    return `{${writeBodyType(type.definition)}}${writeExtractedProperties(
      type.extract
    )}`;
  }
  return `{${writeBodyType(type)}}`;
}

function writeUnionType(type: IUnionType): string {
  if (type.extract) {
    return `(${type.definition
      .map(writeType)
      .join('|')})${writeExtractedProperties(type.extract)}`;
  }
  return type.definition.map(writeType).join('|');
}

function writeStringLiteralType(type: IStringLiteralType): string {
  return `'${type.definition}'`;
}

function writeNumberLiteralType(type: INumberLiteralType): string {
  return `${type.definition}`;
}

function writeBooleanLiteralType(type: IBooleanLiteralType): string {
  return `${type.definition}`;
}

function writeTupleType(type: ITupleType): string {
  return `[${type.definition
    .map(writeType)
    .join(',')}]${writeExtractedProperties(type.extract)}`;
}

function writeIdentifierType(type: IIdentifierType) {
  return `${type.definition}${writeExtractedProperties(type.extract)}`;
}

function writeTypePropertyType(type: ITypePropertyType) {
  const wrap = (value: string) => `[${value}]`;
  if (typeof type === 'string') {
    return wrap(writeType(type));
  }

  switch (type.type) {
    case 'raw_property_type':
      return wrap(writeRawTypePropertyType(type));
    default:
      return wrap(writeType(type));
  }
}

function writeRawTypePropertyType(type: IRawTypePropertyType) {
  return type.definition;
}

function writeDecorationType(type: IDecorationType): string {
  return type.decorate(...type.definition.map(writeType));
}

export function writeType(type: IType | undefined): string {
  if (typeof type === 'string') {
    return type;
  }
  if (!type) {
    return 'never';
  }

  if (typeof type === 'object' && !type.type) {
    return writeObjectType(type);
  }

  switch (type.type) {
    case 'array':
      return writeArrayType(type);
    case 'object':
      return writeObjectType(type);
    case 'union':
      return writeUnionType(type);
    case 'string_literal':
      return writeStringLiteralType(type);
    case 'number_literal':
      return writeNumberLiteralType(type);
    case 'boolean_literal':
      return writeBooleanLiteralType(type);
    case 'tuple':
      return writeTupleType(type);
    case 'identifier':
      return writeIdentifierType(type);
    case 'decoration':
      return writeDecorationType(type);
    default:
      return 'never';
  }
}

export function writeBodyType(body: IBodyType): string {
  return Object.entries(body)
    .map(([key, value]) => {
      const type = Array.isArray(value) ? value[0] : value;
      const required = Array.isArray(value) ? value[1] : true;
      return `${key}${required ? '' : '?'}: ${writeType(type)}`;
    })
    .join(';');
}

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
