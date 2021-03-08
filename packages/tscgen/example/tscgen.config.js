"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const config = {
    outDir: path_1.default.resolve(__dirname, './dist'),
    projectDir: path_1.default.resolve(__dirname, './src'),
};
exports.default = config;
