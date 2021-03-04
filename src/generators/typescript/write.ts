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
  IGenericOptions,
  IRawIdentifierType,
  IGenericIdentifierType,
} from './types';

export function writeGeneric(
  values?: Readonly<IGenericValue<string, IGenericOptions>[]>
): string {
  if (!values?.length) {
    return '';
  }

  function writeValue(generic: IGenericValue<string, IGenericOptions>): string {
    const extendsStr = generic.options?.extendsValue
      ? ` extends ${generic.options.extendsValue}`
      : '';
    const defaultStr = generic.options?.defaultValue
      ? ` = ${generic.options.defaultValue}`
      : '';
    return `${generic.name}${extendsStr}${defaultStr}`;
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
  return `{${writeBodyType(type.definition)}}${writeExtractedProperties(
    type.extract
  )}`;
}

function writeUnionType(type: IUnionType): string {
  if (type.extract?.length) {
    return `(${type.definition
      .map(writeType)
      .join('|')})${writeExtractedProperties(type.extract)}`;
  }
  return type.definition.length === 0
    ? 'never'
    : type.definition.map(writeType).join('|');
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
  return `${type.definition.varName}${writeExtractedProperties(type.extract)}`;
}

function writeRawType(type: IRawIdentifierType) {
  return type.definition;
}

function writeGenericIdentifierType(type: IGenericIdentifierType) {
  return type.definition;
}

function writeTypePropertyType(type: ITypePropertyType) {
  const wrap = (value: string) => `[${value}]`;

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

  switch (type.type) {
    case 'string':
      return type.type;
    case 'number':
      return type.type;
    case 'boolean':
      return type.type;
    case 'undefined':
      return type.type;
    case 'null':
      return type.type;
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
    case 'raw_identifier':
      return writeRawType(type);
    case 'generic_identifier':
      return writeGenericIdentifierType(type);
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
