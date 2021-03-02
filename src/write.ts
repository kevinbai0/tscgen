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

function writeArrayType(type: IArrayType): string {
  return `${writeType(type.definition)}[]`;
}

function writeObjectType(type: IObjectType): string {
  return `{${writeBodyType(type.definition)}}`;
}

function writeUnionType(type: IUnionType): string {
  return type.definition.map(writeType).join(' | ');
}

function writeStringLiteralType(type: IStringLiteralType): string {
  return `'${type.definition}'`;
}

function writeNumberLiteralType(type: INumberLiteralType): string {
  return `${type.definition}`;
}

function writeTupleType(type: ITupleType): string {
  return `[${type.definition.map(writeType).join(',')}]`;
}

function writeIdentifierType(type: IIdentifierType) {
  return type.definition;
}

export function writeType(type: IType | undefined): string {
  if (typeof type === 'string') {
    return type;
  }
  if (!type) {
    return 'never';
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
    case 'tuple':
      return writeTupleType(type);
    case 'identifier':
      return writeIdentifierType(type);
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
