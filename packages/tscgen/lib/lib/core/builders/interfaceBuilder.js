"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interfaceBuilder = void 0;
const write_1 = require("../../typescript/write");
const definitions_1 = require("../../typescript/definitions");
function interfaceBuilder(interfaceName, defaultOptions = {
    body: {},
    export: false,
}) {
    function build() {
        const extendsStr = defaultOptions.extends
            ? ` extends ${write_1.writeType(defaultOptions.extends)}`
            : '';
        return `${defaultOptions.export ? 'export ' : ''}interface ${interfaceName}${write_1.writeGeneric(defaultOptions.generics ?? [])}${extendsStr} {${write_1.writeBodyType(defaultOptions.body)}}`;
    }
    return {
        type: 'interface',
        addGeneric(name, options) {
            return interfaceBuilder(interfaceName, {
                ...defaultOptions,
                generics: [
                    ...(defaultOptions.generics ?? []),
                    { name, options },
                ],
            });
        },
        addBody(body) {
            return interfaceBuilder(interfaceName, {
                ...defaultOptions,
                body: {
                    ...defaultOptions.body,
                    ...body,
                },
            });
        },
        extends(type) {
            return interfaceBuilder(interfaceName, {
                ...defaultOptions,
                extends: definitions_1.identifierType(type),
            });
        },
        toString() {
            return build();
        },
        get varName() {
            return interfaceName;
        },
        markExport: () => interfaceBuilder(interfaceName, {
            ...defaultOptions,
            export: true,
        }),
        get body() {
            return defaultOptions.body;
        },
        get generics() {
            return (defaultOptions.generics ?? []);
        },
    };
}
exports.interfaceBuilder = interfaceBuilder;
