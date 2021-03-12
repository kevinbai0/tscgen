import fs from 'fs';
import path from 'path';
import { expect } from 'chai';
import {
  arrayType,
  booleanType,
  extract,
  genericType,
  identifierType,
  keyOfExtractor,
  numberType,
  objectType,
  readonly,
  stringTuple,
  stringType,
  undefinedType,
  unionType,
} from '../definitions';
import { IBodyType } from '../types';
import { routes } from '@tests/config/sample';
import { Query } from '@tests/config/types';
import { importBuilder } from 'src/core/builders/importBuilder';
import { interfaceBuilder } from 'src/core/builders/interfaceBuilder';
import { typeAliasBuilder } from 'src/core/builders/typeBuilder';
import { createFormatter } from 'src/core/format';
import { combine, mapObject } from 'src/core/util';

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

const format = createFormatter(__filename);

describe('Generates routes correctly', () => {
  it('generates sample test correctly', async () => {
    function writeQueryBody(query: Query | undefined): IBodyType {
      return mapObject(query ?? {}, (value) => {
        const q = cleanQuery(value);
        return [
          q.type === 'string' ? stringType() : arrayType(stringType()),
          q.required,
        ];
      });
    }

    function writeBreadcrumbs(breadcrumbs: CleanBreadcrumbs): IBodyType {
      return {
        params: stringTuple(
          ...(breadcrumbs.dynamic ? breadcrumbs.params ?? [] : [])
        ),
        template: stringType(breadcrumbs.template ?? breadcrumbs.name ?? ''),
        dependsOn: stringTuple(...(breadcrumbs.dependsOn ?? [])),
      };
    }

    const builders = Object.entries(routes).map(([name, route]) => {
      return interfaceBuilder(`I${name}Page`).addBody({
        name: stringType(name),
        route: stringType(route.route),
        params: route.params?.length
          ? stringTuple(...route.params)
          : undefinedType(),
        query: objectType(writeQueryBody(route.query)),
        breadcrumbs: objectType(
          writeBreadcrumbs(route.breadcrumb as CleanBreadcrumbs)
        ),
      });
    });
    const routesType = typeAliasBuilder('Routes').addUnion(
      ...builders.map((builder) => identifierType(builder))
    );

    const routeType = typeAliasBuilder('Route').addUnion(
      identifierType(routesType, keyOfExtractor(routesType))
    );

    const sampleOutput = await fs.promises.readFile(
      path.join('tests/config/output.snapshot.ts'),
      'utf-8'
    );

    const output = await format(combine(...builders, routesType, routeType));
    expect(output).equal(sampleOutput);
  });

  it('works with interfaces', async () => {
    const build = interfaceBuilder('IExtendable')
      .markExport()
      .addBody({
        name: stringType('hello'),
      });

    expect(build.toString()).to.eq(
      `export interface IExtendable {name: 'hello'}`
    );
  });

  it('works with interface extends identifier', async () => {
    const parent = interfaceBuilder('IParent').addBody({
      name: stringType(),
    });
    const build = interfaceBuilder('IExtendable')
      .markExport()
      .extends(parent)
      .addBody({
        name: stringType('hello'),
        value: readonly(
          objectType({
            name: stringType('world'),
          })
        ),
      });

    const output = combine(parent, build);
    expect(output).to.eq(
      "\ninterface IParent {name: string}\n\nexport interface IExtendable extends IParent {name: 'hello';value: Readonly<{name: 'world'}>}"
    );
  });

  it('readonly works', async () => {
    const build = typeAliasBuilder('TestReadonly')
      .markExport()
      .addUnion(
        readonly(
          objectType({
            name: stringType(),
          })
        )
      );

    const output = combine(build);
    expect(output).to.eq(
      '\nexport type TestReadonly = Readonly<{name: string}>;'
    );
  });

  it('extract works', async () => {
    const build = typeAliasBuilder('TestReadonly')
      .markExport()
      .addUnion(extract(stringType('a', 'b', 'c'), stringType('a')));

    const output = combine(build);
    expect(output).to.eq(
      "\nexport type TestReadonly = Extract<'a'|'b'|'c', 'a'>;"
    );
  });

  it('union types', async () => {
    const union = unionType(
      objectType({
        name: stringType(),
      }),
      objectType({
        name: booleanType(),
      })
    );

    const output = combine(
      typeAliasBuilder('Test').addUnion(union),
      typeAliasBuilder('Empty').addUnion(unionType())
    );
    expect(output).to.equal(
      '\ntype Test = {name: string}|{name: boolean};\n\ntype Empty = never;'
    );
  });

  it('generic types', async () => {
    const ResponseMessage = typeAliasBuilder('ResponseMessage')
      .addGeneric('T')
      .addUnion(
        objectType({
          success: booleanType(true),
          status: numberType(),
          data: genericType('T'),
        })
      )
      .addUnion(
        objectType({
          success: booleanType(false),
          status: numberType(),
          error: stringType(),
        })
      );

    const output = combine(ResponseMessage);
    expect(output).to.equal(
      '\ntype ResponseMessage<T> = {success: true;status: number;data: T} | {success: false;status: number;error: string};'
    );
  });
  it('imports work', () => {
    const other = interfaceBuilder('Other').addBody({});
    const i1 = importBuilder().addImportLocation('./value').toString();
    const i2 = importBuilder()
      .addModules(other)
      .addModules()
      .addImportLocation('./value')
      .toString();
    const i3 = importBuilder()
      .addAllModuleImports('test')
      .addImportLocation('./value')
      .toString();
    const i4 = importBuilder()
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
