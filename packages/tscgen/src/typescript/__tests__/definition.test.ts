import fs from 'fs';
import path from 'path';
import { expect } from 'chai';
import { routes } from '@tests/config/sample';
import { Query } from '@tests/config/types';
import * as tscgen from 'tscgen';

const cleanQuery = (query: Query[keyof Query]) =>
  typeof query === 'string'
    ? { type: query, required: false }
    : {
        type: query.type,
        required: !!query.required,
      };

type CleanBreadcrumbs = {
  root: boolean;
  dynamic: boolean;
  params?: string[];
  template?: string;
  name?: string;
  dependsOn?: string[];
};

const format = tscgen.createFormatter(__filename);

describe('Generates routes correctly', () => {
  it('generates sample test correctly', async () => {
    function writeQueryBody(query: Query | undefined): tscgen.IBodyType {
      return tscgen.mapObject(query ?? {}, (value) => {
        const q = cleanQuery(value);
        return [
          q.type === 'string'
            ? tscgen.stringType()
            : tscgen.arrayType(tscgen.stringType()),
          q.required,
        ];
      });
    }

    function writeBreadcrumbs(breadcrumbs: CleanBreadcrumbs): tscgen.IBodyType {
      return {
        params: tscgen.stringTuple(
          ...(breadcrumbs.dynamic ? breadcrumbs.params ?? [] : [])
        ),
        template: tscgen.stringType(
          breadcrumbs.template ?? breadcrumbs.name ?? ''
        ),
        dependsOn: tscgen.stringTuple(...(breadcrumbs.dependsOn ?? [])),
      };
    }

    const builders = Object.entries(routes).map(([name, route]) => {
      return tscgen.interfaceBuilder(`I${name}Page`).addBody({
        name: tscgen.stringType(name),
        route: tscgen.stringType(route.route),
        params: route.params?.length
          ? tscgen.stringTuple(...route.params)
          : tscgen.undefinedType(),
        query: tscgen.objectType(writeQueryBody(route.query)),
        breadcrumbs: tscgen.objectType(
          writeBreadcrumbs(route.breadcrumb as CleanBreadcrumbs)
        ),
      });
    });
    const routesType = tscgen
      .typeDefBuilder('Routes')
      .addUnion(...builders.map((builder) => tscgen.identifierType(builder)));

    const routeType = tscgen
      .typeDefBuilder('Route')
      .addUnion(
        tscgen.identifierType(routesType, tscgen.keyOfExtractor(routesType))
      );

    const sampleOutput = await fs.promises.readFile(
      path.join('tests/config/output.snapshot.ts'),
      'utf-8'
    );

    const output = await format(
      tscgen.combine(...builders, routesType, routeType)
    );
    expect(output).equal(sampleOutput);
  });

  it('works with interfaces', async () => {
    const build = tscgen
      .interfaceBuilder('IExtendable')
      .markExport()
      .addBody({
        name: tscgen.stringType('hello'),
      });

    expect(build.toString()).to.eq(
      `export interface IExtendable {name: 'hello'}`
    );
  });

  it('works with interface extends identifier', async () => {
    const parent = tscgen.interfaceBuilder('IParent').addBody({
      name: tscgen.stringType(),
    });
    const build = tscgen
      .interfaceBuilder('IExtendable')
      .markExport()
      .extends(parent)
      .addBody({
        name: tscgen.stringType('hello'),
        value: tscgen.readonly(
          tscgen.objectType({
            name: tscgen.stringType('world'),
          })
        ),
      });

    const output = tscgen.combine(parent, build);
    expect(output).to.eq(
      "\ninterface IParent {name: string}\n\nexport interface IExtendable extends IParent {name: 'hello';value: Readonly<{name: 'world'}>}"
    );
  });

  it('readonly works', async () => {
    const build = tscgen
      .typeDefBuilder('TestReadonly')
      .markExport()
      .addUnion(
        tscgen.readonly(
          tscgen.objectType({
            name: tscgen.stringType(),
          })
        )
      );

    const output = tscgen.combine(build);
    expect(output).to.eq(
      '\nexport type TestReadonly = Readonly<{name: string}>;'
    );
  });

  it('extract works', async () => {
    const build = tscgen
      .typeDefBuilder('TestReadonly')
      .markExport()
      .addUnion(
        tscgen.extract(tscgen.stringType('a', 'b', 'c'), tscgen.stringType('a'))
      );

    const output = tscgen.combine(build);
    expect(output).to.eq(
      "\nexport type TestReadonly = Extract<'a'|'b'|'c', 'a'>;"
    );
  });

  it('union types', async () => {
    const union = tscgen.unionType([
      tscgen.objectType({
        name: tscgen.stringType(),
      }),
      tscgen.objectType({
        name: tscgen.booleanType(),
      }),
    ]);

    const output = tscgen.combine(
      tscgen.typeDefBuilder('Test').addUnion(union),
      tscgen.typeDefBuilder('Empty').addUnion(tscgen.unionType([]))
    );
    expect(output).to.equal(
      '\ntype Test = {name: string}|{name: boolean};\n\ntype Empty = never;'
    );
  });

  it('generic types', async () => {
    const ResponseMessage = tscgen
      .typeDefBuilder('ResponseMessage')
      .addGeneric('T')
      .addUnion(
        tscgen.objectType({
          success: tscgen.booleanType(true),
          status: tscgen.numberType(),
          data: tscgen.genericType('T'),
        })
      )
      .addUnion(
        tscgen.objectType({
          success: tscgen.booleanType(false),
          status: tscgen.numberType(),
          error: tscgen.stringType(),
        })
      );

    const output = tscgen.combine(ResponseMessage);
    expect(output).to.equal(
      '\ntype ResponseMessage<T> = {success: true;status: number;data: T} | {success: false;status: number;error: string};'
    );
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

    expect(i1).to.equal(`import './value';`);
    expect(i2).to.equal(`import {Other} from './value';`);
    expect(i3).to.equal(`import * as test from './value';`);
    expect(i4).to.equal(`import deee, * as test from './value';`);
  });
});