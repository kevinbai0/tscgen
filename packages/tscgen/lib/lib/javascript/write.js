"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeJsValue = exports.writeJsBody = exports.writeJsIdentifier = exports.writeJsArray = exports.writeJsObject = exports.writeJsBoolean = exports.writeJsString = exports.writeJsNumber = void 0;
function writeJsNumber(value) {
    return `${value}`;
}
exports.writeJsNumber = writeJsNumber;
function writeJsString(value) {
    return `'${value}'`;
}
exports.writeJsString = writeJsString;
function writeJsBoolean(value) {
    return `${value}`;
}
exports.writeJsBoolean = writeJsBoolean;
function writeJsObject(value) {
    return `{${writeJsBody(value.value)}}`;
}
exports.writeJsObject = writeJsObject;
function writeJsArray(value) {
    return `[${value.map(writeJsValue).join(',')}]`;
}
exports.writeJsArray = writeJsArray;
function writeJsIdentifier(value) {
    return value.value;
}
exports.writeJsIdentifier = writeJsIdentifier;
function writeJsBody(body) {
    return Object.entries(body)
        .map(([key, value]) => `${key}: ${writeJsValue(value)}`)
        .join(',');
}
exports.writeJsBody = writeJsBody;
function writeJsValue(value) {
    function handleObject(value) {
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
exports.writeJsValue = writeJsValue;
