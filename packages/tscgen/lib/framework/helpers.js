"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExports = exports.createStaticExports = exports.createPathExport = exports.createMappedExports = exports.createInputsExport = void 0;
const createInputsExport = (method) => method;
exports.createInputsExport = createInputsExport;
const createMappedExports = (...order) => (
// eslint-disable-next-line @typescript-eslint/naming-convention
_getInputs, getMappedExports) => {
    return async (data) => {
        const res = await getMappedExports(data);
        return {
            imports: res.imports,
            exports: {
                values: res.exports,
                order,
            },
        };
    };
};
exports.createMappedExports = createMappedExports;
const createPathExport = (...path) => path;
exports.createPathExport = createPathExport;
const createStaticExports = (...order) => (getBuilders) => async () => {
    const res = await getBuilders();
    return {
        imports: res.imports,
        exports: {
            order,
            values: res.exports,
        },
    };
};
exports.createStaticExports = createStaticExports;
function createExports(imports, ...exports) {
    return {
        exports,
        imports,
    };
}
exports.createExports = createExports;
