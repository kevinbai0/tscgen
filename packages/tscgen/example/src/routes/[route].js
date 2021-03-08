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
const writeParam_1 = require("../../helpers/writeParam");
const writeRequestBody_1 = require("../../helpers/writeRequestBody");
exports.getPath = __filename;
const capFirst = (val) => {
    return val.slice(0, 1).toUpperCase() + val.slice(1);
};
exports.getInputs = tscgen.createInputsExport(() => {
    const data = data_1.getPaths();
    return data.map((info) => ({
        params: {
            route: `${capFirst(info.pathInfo.operationId)}Route`,
        },
        data: info,
    }));
});
exports.getMappedExports = tscgen.createMappedExports('route')(exports.getInputs, async ({ data, params }) => {
    const method = data.pathInfo.method;
    const pathParams = writeParam_1.writeParam(data.pathInfo.parameters, (val) => val.in === 'path');
    const queryParams = writeParam_1.writeParam(data.pathInfo.parameters, (val) => val.in === 'query');
    const modelsRef = await tscgen.getReference(Promise.resolve().then(() => __importStar(require('../models/[name]'))), exports.getPath);
    const requestBody = await writeRequestBody_1.writeRequestBody(data.pathInfo.requestBody, {
        resolveReference: async (ref) => {
            const res = await modelsRef
                .referenceMappedExports('routes')
                .filter((data) => data.data.name === ref);
            return {
                typeIdentifier: tscgen.identifierType(res.exports[0]),
                importValue: res.imports[0],
            };
        },
    });
    const requestBodyUnion = tscgen.unionType(requestBody.flatMap((body) => body.type));
    const combinedType = (() => {
        if (queryParams && requestBodyUnion.definition.length) {
            return tscgen.objectType({
                query: queryParams,
                body: requestBodyUnion,
            });
        }
        else {
            return queryParams ?? requestBodyUnion;
        }
    })();
    return {
        imports: requestBody.flatMap((body) => body.imports),
        exports: {
            get route() {
                return tscgen
                    .typeDefBuilder(params.route)
                    .markExport()
                    .addUnion(tscgen.objectType({
                    method: tscgen.stringType(method),
                    path: tscgen.stringType(data.route),
                    params: pathParams ?? tscgen.undefinedType(),
                    query: queryParams ?? tscgen.undefinedType(),
                    requestBody: requestBodyUnion,
                    combined: combinedType,
                }));
            },
        },
    };
});
