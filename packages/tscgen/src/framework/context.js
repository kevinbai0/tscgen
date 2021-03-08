"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = void 0;
const lib_1 = require("../lib");
const definitions_1 = require("../lib/common/definitions");
const getFilename_1 = require("./getFilename");
async function createContext(getInputs, mappedExports, getPath, options) {
    const inputs = await Promise.resolve(getInputs());
    const state = inputs.map((val) => [val, undefined]);
    const context = {
        referenceIdentifier: (pick) => {
            return {
                findOne: (method) => {
                    const foundIndex = state.findIndex(([inputData]) => method(inputData));
                    if (foundIndex === -1) {
                        throw new Error(`No reference found`);
                    }
                    const found = state[foundIndex];
                    return {
                        importValue: lib_1.importBuilder()
                            .addModules(definitions_1.lazyImportType(() => definitions_1.importModuleType(found[1][pick])))
                            .addImportLocation(getFilename_1.getFilename(getPath, getPath, found[0].params)),
                        typeIdentifier: lib_1.lazyType(() => {
                            return lib_1.identifierType(found[1][pick]);
                        }),
                    };
                },
            };
        },
    };
    const res = await Promise.all(inputs.map(async (inputData, index) => {
        const outputData = await mappedExports({
            ...inputData,
            context,
        });
        // update context
        state[index][1] = outputData.exports.values;
        return {
            inputData,
            ...outputData,
        };
    }));
    return res.filter((val) => options?.filter?.(val.inputData) ?? true);
}
exports.createContext = createContext;
