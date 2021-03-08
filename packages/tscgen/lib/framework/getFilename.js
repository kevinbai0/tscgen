"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilename = void 0;
const path_1 = __importDefault(require("path"));
const getFilename = (toFile, caller, params) => {
    const callerComponents = caller.split('/');
    const referenceComponents = toFile.split('/');
    const relativePath = path_1.default.relative(callerComponents.slice(0, -1).join('/'), referenceComponents.slice(0, -1).join('/'));
    const dir = relativePath.startsWith('..')
        ? `${relativePath.length ? `${relativePath}/` : ''}`
        : `./${relativePath.length ? `${relativePath}/` : ''}`;
    const outFile = Object.entries(params).reduce((acc, [key, value]) => acc.replace(`[${key}]`, value), referenceComponents.slice(-1)[0].split('.').slice(0, -1).join('.'));
    return `${dir}${outFile}`;
};
exports.getFilename = getFilename;
