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
const path_1 = __importDefault(require("path"));
const chai_1 = require("chai");
const tscgen = __importStar(require("../src/lib"));
const format = tscgen.createFormatter(path_1.default.resolve(__dirname, '../src/lib/index.ts'));
describe('writes javascript object code', () => {
    it('works', async () => {
        const output = tscgen
            .varObjectBuilder('test')
            .setLevel('const')
            .markExport()
            .addBody({
            name: 'Hello',
        });
        const formatted = await format(output.toString());
        chai_1.expect(formatted).to.equal(`export const test = { name: 'Hello' };\n`);
    });
    it('works with type definitions', async () => {
        const output = tscgen
            .varObjectBuilder('test')
            .setLevel('const')
            .markExport()
            .addTypeDef(tscgen.objectType({
            cool: tscgen.arrayType(tscgen.numberType()),
        }))
            .addBody({
            cool: [5, 6, 7, 8],
        });
        const formatted = await format(output.toString());
        chai_1.expect(formatted).to.equal(`export const test: { cool: number[] } = { cool: [5, 6, 7, 8] };\n`);
    });
});
