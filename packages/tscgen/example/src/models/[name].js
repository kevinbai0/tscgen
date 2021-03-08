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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMappedExports = exports.getInputs = exports.getPath = void 0;
const tscgen = __importStar(require("../../../src/framework"));
const data_1 = require("../../helpers/data");
const writeSchema_1 = require("../../helpers/writeSchema");
exports.getPath = __filename;
exports.getInputs = tscgen.createInputsExport(() => data_1.getSchemas().map((data) => ({
    data,
    params: {
        name: `I${data.name}Model`,
    },
})));
exports.getMappedExports = tscgen.createMappedExports('routes')(exports.getInputs, async ({ data, params, context }) => {
    const body = await writeSchema_1.writeSchema(data.schema, {
        resolveReference: (importName) => {
            return context
                .referenceIdentifier('routes')
                .findOne((value) => value.data.name === importName);
        },
    });
    return {
        imports: body.imports,
        exports: {
            get routes() {
                return tscgen
                    .typeDefBuilder(params.name)
                    .markExport()
                    .addUnion(body.type);
            },
        },
    };
});
