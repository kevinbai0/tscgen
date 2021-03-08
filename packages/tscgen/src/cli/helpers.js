"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withApplyFn = exports.recursiveDir = exports.apply = exports.extractFiles = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function extractFiles(dir, paths, extractFn, basePath) {
    function matchesPath(p) {
        const match = paths.find((path) => path.includes(p) || p.includes(path));
        return !!match;
    }
    const base = basePath ?? dir.path;
    const relPath = path_1.default.relative(base, dir.path);
    if (!matchesPath(relPath)) {
        return Promise.resolve([]);
    }
    const then = await Promise.all(dir.files.map((file) => {
        if (file.type === 'dir') {
            return extractFiles(file, paths, extractFn, base);
        }
        if (matchesPath(path_1.default.join(file.path, file.filename))) {
            return Promise.resolve([extractFn(file)]);
        }
        return Promise.resolve([]);
    }));
    return then.flat();
}
exports.extractFiles = extractFiles;
async function apply(dir, applyFn) {
    const newFiles = await Promise.all(dir.files.map(async (file) => {
        if (file.type === 'dir') {
            return apply(file, applyFn);
        }
        return {
            ...file,
            data: await applyFn(file),
        };
    }));
    return {
        ...dir,
        files: newFiles,
    };
}
exports.apply = apply;
async function recursiveDir(dir) {
    const files = await fs_1.default.promises.readdir(dir);
    const resolved = files.map(async (file) => {
        const stat = await fs_1.default.promises.stat(path_1.default.resolve(dir, file));
        if (stat.isDirectory()) {
            return {
                type: 'dir',
                filename: file,
                path: dir,
                files: [],
            };
        }
        return {
            type: 'file',
            path: dir,
            filename: file,
            data: {},
        };
    });
    const fileData = await Promise.all(resolved);
    return Promise.all(fileData.map(async (data) => {
        if (data.type === 'file') {
            return data;
        }
        return {
            ...data,
            files: await recursiveDir(path_1.default.resolve(dir, data.filename)),
        };
    }));
}
exports.recursiveDir = recursiveDir;
const withApplyFn = (applyFn) => {
    return applyFn;
};
exports.withApplyFn = withApplyFn;
