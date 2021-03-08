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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chai_1 = require("chai");
const tscgen = __importStar(require("../src/lib/index"));
const index_1 = require("../src/lib/index");
const sample_1 = require("./config/sample");
const cleanQuery = (query) => typeof query === 'string'
    ? { type: query, required: false }
    : {
        type: query.type,
        required: !!query.required,
    };
const format = tscgen.createFormatter(path_1.default.resolve(__dirname, '../src/lib/index.ts'));
describe('Generates routes correctly', () => {
    it('generates sample test correctly', async () => {
        function writeQueryBody(query) {
            return tscgen.mapObject(query ?? {}, (value) => {
                const q = cleanQuery(value);
                return [
                    q.type === 'string' ? index_1.stringType() : tscgen.arrayType(index_1.stringType()),
                    q.required,
                ];
            });
        }
        function writeBreadcrumbs(breadcrumbs) {
            return {
                params: tscgen.stringTuple(...(breadcrumbs.dynamic ? breadcrumbs.params ?? [] : [])),
                template: tscgen.stringType(breadcrumbs.template ?? breadcrumbs.name ?? ''),
                dependsOn: tscgen.stringTuple(...(breadcrumbs.dependsOn ?? [])),
            };
        }
        const builders = Object.entries(sample_1.routes).map(([name, route]) => {
            return tscgen.interfaceBuilder(`I${name}Page`).addBody({
                name: tscgen.stringType(name),
                route: tscgen.stringType(route.route),
                params: route.params?.length
                    ? tscgen.stringTuple(...route.params)
                    : index_1.undefinedType(),
                query: tscgen.objectType(writeQueryBody(route.query)),
                breadcrumbs: tscgen.objectType(writeBreadcrumbs(route.breadcrumb)),
            });
        });
        const routesType = tscgen
            .typeDefBuilder('Routes')
            .addUnion(...builders.map((builder) => tscgen.identifierType(builder)));
        const routeType = tscgen
            .typeDefBuilder('Route')
            .addUnion(tscgen.identifierType(routesType, tscgen.keyOfExtractor(routesType)));
        const sampleOutput = await fs_1.default.promises.readFile(path_1.default.join(__dirname, 'config/output.snapshot.ts'), 'utf-8');
        const output = await format(tscgen.combine(...builders, routesType, routeType));
        chai_1.expect(output).equal(sampleOutput);
    });
    it('works with interfaces', async () => {
        const build = tscgen
            .interfaceBuilder('IExtendable')
            .markExport()
            .addBody({
            name: tscgen.stringType('hello'),
        });
        const formatted = await format(build.toString());
        chai_1.expect(formatted).to.eq(`export interface IExtendable {\n  name: 'hello';\n}\n`);
    });
    it('works with interface extends identifier', async () => {
        const parent = tscgen.interfaceBuilder('IParent').addBody({
            name: index_1.stringType(),
        });
        const build = tscgen
            .interfaceBuilder('IExtendable')
            .markExport()
            .extends(parent)
            .addBody({
            name: tscgen.stringType('hello'),
            value: tscgen.readonly(tscgen.objectType({
                name: tscgen.stringType('world'),
            })),
        });
        const formatted = await format(tscgen.combine(parent, build));
        chai_1.expect(formatted).to.eq(`interface IParent {\n  name: string;\n}\n\nexport interface IExtendable extends IParent {\n  name: 'hello';\n  value: Readonly<{ name: 'world' }>;\n}\n`);
    });
    it('readonly works', async () => {
        const build = tscgen
            .typeDefBuilder('TestReadonly')
            .markExport()
            .addUnion(tscgen.readonly(tscgen.objectType({
            name: index_1.stringType(),
        })));
        const formatted = await format(tscgen.combine(build));
        chai_1.expect(formatted).to.eq(`export type TestReadonly = Readonly<{ name: string }>;\n`);
    });
    it('extract works', async () => {
        const build = tscgen
            .typeDefBuilder('TestReadonly')
            .markExport()
            .addUnion(tscgen.extract(tscgen.stringType('a', 'b', 'c'), tscgen.stringType('a')));
        const formatted = await format(tscgen.combine(build));
        chai_1.expect(formatted).to.eq(`export type TestReadonly = Extract<'a' | 'b' | 'c', 'a'>;\n`);
    });
    it('union types', async () => {
        const union = tscgen.unionType([
            tscgen.objectType({
                name: index_1.stringType(),
            }),
            tscgen.objectType({
                name: index_1.booleanType(),
            }),
        ]);
        const res = await format(tscgen.combine(tscgen.typeDefBuilder('Test').addUnion(union), tscgen.typeDefBuilder('Empty').addUnion(tscgen.unionType([]))));
        chai_1.expect(res).to.equal(`type Test = { name: string } | { name: boolean };\n\ntype Empty = never;\n`);
    });
    it('generic types', async () => {
        const ResponseMessage = tscgen
            .typeDefBuilder('ResponseMessage')
            .addGeneric('T')
            .addUnion(tscgen.objectType({
            success: tscgen.booleanType(true),
            status: tscgen.numberType(),
            data: index_1.genericType('T'),
        }))
            .addUnion(tscgen.objectType({
            success: tscgen.booleanType(false),
            status: tscgen.numberType(),
            error: tscgen.stringType(),
        }));
        const res = await format(tscgen.combine(ResponseMessage));
        chai_1.expect(res).to.equal(`type ResponseMessage<T> =\n  | { success: true; status: number; data: T }\n  | { success: false; status: number; error: string };\n`);
    });
    it('imports work', () => {
        const other = tscgen.interfaceBuilder('Other').addBody({});
        const i1 = tscgen.importBuilder().addImportLocation('./value').toString();
        const i2 = tscgen
            .importBuilder()
            .addModules(other)
            .addModules()
            .addImportLocation('./value')
            .toString();
        const i3 = tscgen
            .importBuilder()
            .addAllModuleImports('test')
            .addImportLocation('./value')
            .toString();
        const i4 = tscgen
            .importBuilder()
            .addDefaultImport('deee')
            .addAllModuleImports('test')
            .addImportLocation('./value')
            .toString();
        chai_1.expect(i1).to.equal(`import './value';`);
        chai_1.expect(i2).to.equal(`import {Other} from './value';`);
        chai_1.expect(i3).to.equal(`import * as test from './value';`);
        chai_1.expect(i4).to.equal(`import deee, * as test from './value';`);
    });
});
