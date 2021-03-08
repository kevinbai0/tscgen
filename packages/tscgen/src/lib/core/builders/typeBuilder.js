"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefBuilder = void 0;
const write_1 = require("../../typescript/write");
function typeDefBuilder(name, defaultOptions = {
    export: false,
}) {
    function build() {
        const genericsStr = write_1.writeGeneric(defaultOptions.generics);
        const types = defaultOptions.types?.reduce((acc, pair, i) => {
            if (i === 0) {
                return write_1.writeType(pair.type);
            }
            return `${acc} ${pair.joinType === 'union' ? '|' : '&'} ${write_1.writeType(pair.type)}`;
        }, '') ?? 'never';
        return `${defaultOptions.export ? 'export ' : ''}type ${name}${genericsStr} = ${types};`;
    }
    function newBuilder(joinType) {
        return (...types) => typeDefBuilder(name, {
            ...defaultOptions,
            types: [
                ...(defaultOptions.types ?? []),
                ...types.map((type) => ({
                    type: type,
                    joinType: joinType,
                })),
            ],
        });
    }
    return {
        type: 'type',
        addGeneric(genericName, options) {
            return typeDefBuilder(name, {
                ...defaultOptions,
                generics: [
                    ...(defaultOptions.generics ?? []),
                    { name: genericName, options },
                ],
            });
        },
        addUnion: newBuilder('union'),
        addIntersection: newBuilder('intersection'),
        toString() {
            return build();
        },
        get varName() {
            return name;
        },
        markExport: () => typeDefBuilder(name, {
            ...defaultOptions,
            export: true,
        }),
    };
}
exports.typeDefBuilder = typeDefBuilder;
