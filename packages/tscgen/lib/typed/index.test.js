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
const chai_1 = require("chai");
const tscgen = __importStar(require("../lib"));
describe('Test that types are properly generated without compile time errors', () => {
    it('Basic interface', () => {
        const TestInterface = tscgen.interfaceBuilder('Test').addBody({
            value: tscgen.stringType(),
            array: tscgen.arrayType(tscgen.stringType()),
            union: (() => tscgen.stringType('Hello', 'World'))(),
            tuple: (() => tscgen.numberTuple(1, 2, 3, 4))(),
        });
        const test = {
            array: ['I', 'am', 'an', 'array'],
            value: 'Value string',
            union: 'Hello',
            tuple: [1, 2, 3, 4],
        };
        chai_1.expect(test).equal(test);
    });
});
