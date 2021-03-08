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
exports.writeParam = void 0;
const tscgen = __importStar(require("../../src/lib"));
const writeSchema_1 = require("./writeSchema");
const writeParam = (params, filter) => {
    const filteredParams = filter
        ? params?.filter((val) => writeSchema_1.handleRef(val, {
            ref: () => true,
            notRef: filter,
        }))
        : params;
    if (!filteredParams?.length) {
        return undefined;
    }
    return tscgen.toObjectType(filteredParams, (param) => {
        return writeSchema_1.handleRef(param, {
            ref: () => {
                throw new Error('no params handled');
            },
            notRef: (obj) => {
                return {
                    key: obj.name,
                    value: [tscgen.stringType(), !!obj.required],
                };
            },
        });
    });
};
exports.writeParam = writeParam;
