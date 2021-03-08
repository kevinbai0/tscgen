"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toObjectType = exports.mapObject = exports.mapObjectPromise = exports.combine = void 0;
function combine(...builders) {
    return builders
        .map((builder) => builder.type === 'import' ? builder.toString() : `\n${builder.toString()}`)
        .join('\n');
}
exports.combine = combine;
async function mapObjectPromise(obj, transform) {
    return (await Promise.all(Object.entries(obj).map(async ([key, value]) => [key, await Promise.resolve(transform(value, key))]))).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value,
    }), {});
}
exports.mapObjectPromise = mapObjectPromise;
function mapObject(obj, transform) {
    return Object.entries(obj).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: transform(value, key),
    }), {});
}
exports.mapObject = mapObject;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toObjectType(arr, transform) {
    if (!arr) {
        return {
            type: 'object',
            definition: {},
        };
    }
    const body = arr.reduce((acc, value) => {
        const res = transform(value);
        if (!res) {
            return acc;
        }
        return { ...acc, [res.key]: res.value };
    }, {});
    return {
        type: 'object',
        definition: body,
    };
}
exports.toObjectType = toObjectType;
