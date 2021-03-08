"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyOfExtractor = exports.extract = exports.readonly = exports.genericType = exports.rawType = exports.identifierType = exports.booleanTuple = exports.numberTuple = exports.lazyType = exports.stringTuple = exports.tupleType = exports.objectType = exports.arrayType = exports.intersectionType = exports.unionType = exports.nullType = exports.undefinedType = exports.booleanType = exports.numberType = exports.stringType = void 0;
function stringType(...value) {
    if (!value.length) {
        return {
            type: 'string',
        };
    }
    return {
        type: 'union',
        definition: (value.length === 1
            ? [
                {
                    type: 'string_literal',
                    definition: value[0],
                },
            ]
            : value.map((val) => stringType(val))),
    };
}
exports.stringType = stringType;
function numberType(...value) {
    if (!value.length) {
        return {
            type: 'number',
        };
    }
    return {
        type: 'union',
        definition: (value.length === 1
            ? [
                {
                    type: 'number_literal',
                    definition: value[0],
                },
            ]
            : value.map((val) => numberTuple(val))),
    };
}
exports.numberType = numberType;
function booleanType(...value) {
    if (!value.length) {
        return {
            type: 'boolean',
        };
    }
    return {
        type: 'union',
        definition: (value.length === 1
            ? [
                {
                    type: 'boolean_literal',
                    definition: value[0],
                },
            ]
            : value.map((val) => booleanType(val))),
    };
}
exports.booleanType = booleanType;
function undefinedType() {
    return {
        type: 'undefined',
    };
}
exports.undefinedType = undefinedType;
function nullType() {
    return {
        type: 'null',
    };
}
exports.nullType = nullType;
function unionType(types, ...extract) {
    return {
        type: 'union',
        definition: types,
        extract,
    };
}
exports.unionType = unionType;
function intersectionType(types, ...extract) {
    return {
        type: 'intersection',
        definition: types,
        extract,
    };
}
exports.intersectionType = intersectionType;
function arrayType(type, ...extract) {
    return {
        type: 'array',
        definition: type,
        extract,
    };
}
exports.arrayType = arrayType;
function objectType(type, ...extract) {
    return {
        type: 'object',
        definition: type,
        extract,
    };
}
exports.objectType = objectType;
function tupleType(type, ...extract) {
    return {
        type: 'tuple',
        definition: type,
        extract,
    };
}
exports.tupleType = tupleType;
function stringTuple(...type) {
    return {
        type: 'tuple',
        definition: type.map((val) => stringType(val)),
    };
}
exports.stringTuple = stringTuple;
function lazyType(value) {
    return {
        type: 'lazy_type',
        definition: value,
    };
}
exports.lazyType = lazyType;
function numberTuple(...type) {
    return {
        type: 'tuple',
        definition: type.map((val) => numberType(val)),
    };
}
exports.numberTuple = numberTuple;
function booleanTuple(...type) {
    return {
        type: 'tuple',
        definition: type.map((val) => booleanType(val)),
    };
}
exports.booleanTuple = booleanTuple;
/**
 *
 * @param builder The name of the interace/type
 * @param extract Properties to extract for the identifier (eg: ITest[number][string])
 */
function identifierType(builder, ...extract) {
    return {
        type: 'identifier',
        definition: builder,
        extract,
    };
}
exports.identifierType = identifierType;
function rawType(value) {
    return {
        type: 'raw_identifier',
        definition: value,
    };
}
exports.rawType = rawType;
function genericType(value) {
    return {
        type: 'generic_identifier',
        definition: value,
    };
}
exports.genericType = genericType;
function readonly(type) {
    return {
        type: 'decoration',
        definition: [type],
        decorate: (value) => `Readonly<${value}>`,
    };
}
exports.readonly = readonly;
function extract(type, union) {
    return {
        type: 'decoration',
        definition: [type, union],
        decorate: (value, unionValue) => `Extract<${value}, ${unionValue}>`,
    };
}
exports.extract = extract;
/**
 * References the keyof property for a type/interface
 * @param builder The type/interface to reference
 */
function keyOfExtractor(builder) {
    return {
        type: 'raw_property_type',
        definition: `keyof ${builder.varName}`,
    };
}
exports.keyOfExtractor = keyOfExtractor;
