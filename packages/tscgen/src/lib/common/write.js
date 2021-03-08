"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeImportLazy = exports.writeImportLocation = exports.writeImportDefaultModule = exports.writeImportAllModules = exports.writeImportModule = exports.writeImport = void 0;
function writeImport(type) {
    switch (type.type) {
        case 'import_module':
            return writeImportModule(type);
        case 'import_all_modules':
            return writeImportAllModules(type);
        case 'import_default':
            return writeImportDefaultModule(type);
        case 'import_location':
            return writeImportLocation(type);
        case 'import_lazy':
            return writeImportLazy(type);
    }
}
exports.writeImport = writeImport;
function writeImportModule(value) {
    return `${value.value.varName}`;
}
exports.writeImportModule = writeImportModule;
function writeImportAllModules(value) {
    return `* as ${value.value}`;
}
exports.writeImportAllModules = writeImportAllModules;
function writeImportDefaultModule(value) {
    return `${value.value}`;
}
exports.writeImportDefaultModule = writeImportDefaultModule;
function writeImportLocation(value) {
    return `'${value.value}'`;
}
exports.writeImportLocation = writeImportLocation;
function writeImportLazy(value) {
    return writeImport(value.value());
}
exports.writeImportLazy = writeImportLazy;
