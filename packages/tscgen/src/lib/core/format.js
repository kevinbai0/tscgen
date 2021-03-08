"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFormatter = void 0;
const path_1 = __importDefault(require("path"));
const eslint_1 = __importDefault(require("eslint"));
const createFormatter = (pathToFile) => {
    const linter = new eslint_1.default.ESLint({
        useEslintrc: true,
        fix: true,
        overrideConfig: {
            rules: {
                'import/no-unresolved': 0,
            },
        },
    });
    return async (text) => {
        const res = await linter.lintText(text, {
            filePath: path_1.default.resolve(pathToFile),
        });
        if (!res.length || res[0].errorCount || !res[0].output) {
            const formatter = await linter.loadFormatter();
            throw new Error(formatter.format(res));
        }
        return res[0].output;
    };
};
exports.createFormatter = createFormatter;
