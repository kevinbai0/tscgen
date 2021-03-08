"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeBodyType = exports.writeType = exports.writeGeneric = void 0;
function writeGeneric(values) {
    if (!values?.length) {
        return '';
    }
    function writeValue(generic) {
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
exports.writeGeneric = writeGeneric;
function writeExtractedProperties(type) {
    return type?.map(writeTypePropertyType) ?? '';
}
function writeArrayType(type) {
    return `${writeType(type.definition)}[]${writeExtractedProperties(type.extract)}`;
}
function writeObjectType(type) {
    return `{${writeBodyType(type.definition)}}${writeExtractedProperties(type.extract)}`;
}
function writeUnionType(type) {
    if (type.extract?.length) {
        return `(${type.definition
            .map(writeType)
            .join('|')})${writeExtractedProperties(type.extract)}`;
    }
    return type.definition.length === 0
        ? 'never'
        : type.definition.map(writeType).join('|');
}
function writeIntersectionType(type) {
    if (type.extract?.length) {
        return `(${type.definition
            .map(writeType)
            .join('&')})${writeExtractedProperties(type.extract)}`;
    }
    return type.definition.length === 0
        ? 'never'
        : type.definition.map(writeType).join('&');
}
function writeStringLiteralType(type) {
    return `'${type.definition}'`;
}
function writeNumberLiteralType(type) {
    return `${type.definition}`;
}
function writeBooleanLiteralType(type) {
    return `${type.definition}`;
}
function writeTupleType(type) {
    return `[${type.definition
        .map(writeType)
        .join(',')}]${writeExtractedProperties(type.extract)}`;
}
function writeIdentifierType(type) {
    return `${type.definition.varName}${writeExtractedProperties(type.extract)}`;
}
function writeRawType(type) {
    return type.definition;
}
function writeGenericIdentifierType(type) {
    return type.definition;
}
function writeTypePropertyType(type) {
    const wrap = (value) => `[${value}]`;
    switch (type.type) {
        case 'raw_property_type':
            return wrap(writeRawTypePropertyType(type));
        default:
            return wrap(writeType(type));
    }
}
function writeRawTypePropertyType(type) {
    return type.definition;
}
function writeLazyType(type) {
    return writeType(type.definition());
}
function writeDecorationType(type) {
    return type.decorate(...type.definition.map(writeType));
}
function writeType(type) {
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
        case 'intersection':
            return writeIntersectionType(type);
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
        case 'lazy_type':
            return writeLazyType(type);
        default:
            return 'never';
    }
}
exports.writeType = writeType;
function writeBodyType(body) {
    return Object.entries(body)
        .map(([key, value]) => {
        const type = Array.isArray(value) ? value[0] : value;
        const required = Array.isArray(value) ? value[1] : true;
        return `${key}${required ? '' : '?'}: ${writeType(type)}`;
    })
        .join(';');
}
exports.writeBodyType = writeBodyType;
