"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeSchema = exports.handleRef = exports.filterUndefined = exports.operators = void 0;
const tscgen = __importStar(require("../../src/lib"));
const lib_1 = require("../../src/lib");
exports.operators = [
    'get',
    'put',
    'post',
    'delete',
    'options',
    'head',
    'patch',
    'trace',
];
const filterUndefined = (arr) => {
    return arr.filter((val) => !!val);
};
exports.filterUndefined = filterUndefined;
const handleRef = (ref, options) => {
    if (ref?.$ref) {
        return options.ref(ref);
    }
    return options.notRef(ref);
};
exports.handleRef = handleRef;
const writeSchema = (obj, handlers) => {
    return exports.handleRef(obj, {
        ref: async (ref) => {
            const importName = ref.$ref.split('/').slice(-1)[0];
            const res = await handlers.resolveReference(importName);
            return {
                type: res.typeIdentifier,
                imports: [res.importValue],
            };
        },
        notRef: async (obj) => {
            if (obj.allOf) {
                const allOf = await Promise.all(obj.allOf.map((prop) => exports.writeSchema(prop, handlers)));
                return {
                    type: tscgen.intersectionType(allOf.map((prop) => prop.type)),
                    imports: allOf.flatMap((val) => val.imports),
                };
            }
            if (obj.oneOf) {
                const oneOf = await Promise.all(obj.oneOf.map((prop) => exports.writeSchema(prop, handlers)));
                return {
                    type: tscgen.unionType(oneOf.map((prop) => prop.type)),
                    imports: oneOf.flatMap((val) => val.imports),
                };
            }
            if (obj.type === 'object' || obj.properties) {
                const required = new Set(obj.required ?? []);
                const withSchema = await tscgen.mapObjectPromise(obj.properties ?? {}, async (value, key) => {
                    const newSchema = await exports.writeSchema(value, handlers);
                    return {
                        type: [
                            newSchema.type,
                            required.has(key),
                        ],
                        imports: newSchema.imports,
                    };
                });
                return {
                    type: tscgen.objectType(lib_1.mapObject(withSchema, (val) => val.type)),
                    imports: Object.entries(withSchema).flatMap((val) => val[1].imports),
                };
            }
            else if (obj.type === 'array') {
                const newSchema = await exports.writeSchema(obj.items, handlers);
                return {
                    type: tscgen.arrayType(newSchema.type),
                    imports: newSchema.imports,
                };
            }
            else if (obj.type === 'number' || obj.type === 'integer') {
                return {
                    type: tscgen.numberType(...(obj.enum ?? [])),
                    imports: [],
                };
            }
            else if (obj.type === 'string') {
                return {
                    type: tscgen.stringType(...(obj.enum ?? [])),
                    imports: [],
                };
            }
            else if (obj.type === 'boolean') {
                return {
                    type: tscgen.booleanType(),
                    imports: [],
                };
            }
            throw new Error(`Unknown type ${obj.type}`);
        },
    });
};
exports.writeSchema = writeSchema;
