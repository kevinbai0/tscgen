"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importModuleType = exports.lazyImportType = void 0;
function lazyImportType(value) {
    return {
        type: 'import_lazy',
        value,
    };
}
exports.lazyImportType = lazyImportType;
function importModuleType(value) {
    return {
        type: 'import_module',
        value: value,
    };
}
exports.importModuleType = importModuleType;
