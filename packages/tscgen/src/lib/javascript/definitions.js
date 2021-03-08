"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.identifierValue = exports.objectValue = void 0;
function objectValue(value) {
    return {
        type: 'object',
        value,
    };
}
exports.objectValue = objectValue;
/**
 *
 * @param builder The name of the interace/type
 * @param extract Properties to extract for the identifier (eg: ITest[number][string])
 */
function identifierValue(builder) {
    return {
        type: 'identifier',
        value: builder.varName,
    };
}
exports.identifierValue = identifierValue;
