"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReference = void 0;
const importBuilder_1 = require("../lib/core/builders/importBuilder");
const context_1 = require("./context");
const getFilename_1 = require("./getFilename");
async function getReference(importFile, callerPath) {
    const res = await importFile;
    if (!res.getPath) {
        throw new Error("Can't get references to a file that doesn't export it's path");
    }
    return {
        raw: res,
        referenceMappedExports(...picks) {
            if (!res.getPath) {
                throw new Error("File doesn't reference a path");
            }
            const set = new Set(picks);
            return {
                filter: async (method) => {
                    const ctx = (await context_1.createContext(res.getInputs, res.getMappedExports, res.getPath, { filter: method })).map((val) => ({
                        ...val,
                        data: val.exports,
                    }));
                    return {
                        exports: ctx.flatMap((val) => Object.entries(val.data.values)
                            .filter(([key]) => set.has(key))
                            .map(([, value]) => value)),
                        imports: ctx.map(({ data: { values }, inputData }) => {
                            return importBuilder_1.importBuilder()
                                .addModules(...Object.entries(values)
                                .filter(([key]) => set.has(key))
                                .map(([, value]) => value))
                                .addImportLocation(getFilename_1.getFilename(res.getPath, callerPath, inputData.params));
                        }),
                    };
                },
            };
        },
    };
}
exports.getReference = getReference;
