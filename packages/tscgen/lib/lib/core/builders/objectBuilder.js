"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.varObjectBuilder = void 0;
const definitions_1 = require("../../javascript/definitions");
const write_1 = require("../../javascript/write");
const write_2 = require("../../typescript/write");
const deepMerge = (body, body2) => {
    if (body.type === 'object' &&
        body2.type === 'object') {
        return {
            type: 'object',
            value: {
                ...body.value,
                ...Object.entries(body2.value).reduce((acc, [key, value]) => {
                    if (body.value[key]) {
                        return {
                            ...acc,
                            [key]: deepMerge(body.value[key], value),
                        };
                    }
                    return {
                        ...acc,
                        [key]: value,
                    };
                }, {}),
            },
        };
    }
    if (Array.isArray(body) && Array.isArray(body2)) {
        return [...body, ...body2];
    }
    return body2;
};
const varObjectBuilder = (name, defaultValue = {
    body: {},
    decorate: 'const',
    export: false,
}) => {
    function build() {
        const typeStr = defaultValue.type
            ? `: ${write_2.writeType(defaultValue.type)}`
            : '';
        return `${defaultValue.export ? 'export ' : ''}${defaultValue.decorate} ${name}${typeStr} = ${write_1.writeJsObject({
            type: 'object',
            value: defaultValue.body,
        })}`;
    }
    return {
        varName: name,
        type: 'object',
        addBody: (body) => exports.varObjectBuilder(name, {
            ...defaultValue,
            body: deepMerge(definitions_1.objectValue(defaultValue.body), definitions_1.objectValue(body)).value,
        }),
        markExport: () => exports.varObjectBuilder(name, {
            ...defaultValue,
            export: true,
        }),
        setLevel: (level) => exports.varObjectBuilder(name, {
            ...defaultValue,
            decorate: level,
        }),
        addTypeDef: (type) => exports.varObjectBuilder(name, {
            ...defaultValue,
            type,
        }),
        toString() {
            return build();
        },
    };
};
exports.varObjectBuilder = varObjectBuilder;
