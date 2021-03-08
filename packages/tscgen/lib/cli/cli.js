"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const format_1 = require("../lib/core/format");
const util_1 = require("../lib/core/util");
const context_1 = require("../framework/context");
const helpers_1 = require("./helpers");
const hiddenExtensions = new Set(['config', 'helper']);
const format = format_1.createFormatter(path_1.default.resolve(__dirname, 'cli.ts'));
main().catch(console.error);
async function main() {
    const entryDir = path_1.default.resolve(__dirname, '../../example');
    const config = (await Promise.resolve().then(() => __importStar(require(path_1.default.join(path_1.default.resolve(__dirname, '../../example'), 'tscgen.config.ts'))))).default;
    const outDir = config.outDir ?? './dist';
    const projectDir = path_1.default.resolve(entryDir, config.projectDir ?? '../../example');
    if (!fs_1.existsSync(outDir)) {
        fs_1.mkdirSync(outDir);
    }
    const project = {
        type: 'dir',
        path: projectDir,
        filename: projectDir.split('/').slice(-1).join('/'),
        files: await helpers_1.recursiveDir(projectDir),
    };
    await helpers_1.apply(project, async (file) => {
        const fileComponents = file.filename.split('.');
        const isTypescript = fileComponents.slice(-1)[0] === 'ts';
        const isConfigFile = fileComponents.length > 2 &&
            hiddenExtensions.has(fileComponents.slice(-2, -1)[0]);
        if (isTypescript && !isConfigFile) {
            return {
                out: await writeGroup(path_1.default.join(file.path, file.filename), {
                    projectDir,
                    outDir,
                }),
            };
        }
        return {};
    });
}
async function writeFile(data, filePath, fileData, context) {
    const newRoute = Object.keys(data.params ?? {}).reduce((acc, param) => acc.replace(`[${param}]`, data.params[param]), filePath);
    const outPath = path_1.default.join(context.outDir, path_1.default.relative(context.projectDir, newRoute));
    const pathDir = outPath.split('/').slice(0, -1).join('/');
    if (!(await exists(pathDir))) {
        await fs_1.default.promises.mkdir(pathDir, {
            recursive: true,
        });
    }
    await fs_1.default.promises.writeFile(outPath, fileData);
}
async function writeGroup(filePath, context) {
    const res = await Promise.resolve().then(() => __importStar(require(filePath)));
    if (res.getInputs && res.getMappedExports) {
        const ctx = (await context_1.createContext(res.getInputs, res.getMappedExports, res.getPath)).map(async ({ imports, exports, inputData }) => {
            const fileData = await format(util_1.combine(...(imports ?? []), ...exports.order.map((key) => exports.values[key])));
            await writeFile(inputData, filePath, fileData, context);
        });
        await Promise.all(ctx);
        return true;
    }
    if (res.getStaticExports) {
        const outputData = await res.getStaticExports();
        const fileData = await format(util_1.combine(...(outputData.imports ?? []), ...outputData.exports.order.map((key) => outputData.exports.values[key])));
        await writeFile({ params: {}, data: undefined }, filePath, fileData, context);
    }
    return false;
}
async function exists(dir) {
    try {
        await fs_1.default.promises.stat(dir);
        return true;
    }
    catch (err) {
        return false;
    }
}
