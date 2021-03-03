import fs from 'fs';
import path from 'path';
import { expect } from 'chai';
import * as tscgen from '../src';

import { routes } from './config/sample';
import { Query } from './config/types';

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

describe('Generates routes correctly', () => {
  it('generates sample test correctly', async () => {
    function writeQueryBody(query: Query | undefined): tscgen.IBodyType {
      return tscgen.mapObject(query ?? {}, (value) => {
        const q = cleanQuery(value);
        return [
          q.type === 'string' ? q.type : tscgen.arrayType('string'),
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
          : 'undefined',
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
      path.join(__dirname, 'config/output.snapshot.ts'),
      'utf-8'
    );

    const output = await tscgen.format(
      tscgen.combine(...builders, routesType, routeType)
    );
    expect(output).equal(sampleOutput);
  });

  it('works with interface extends inline object', async () => {
    const build = tscgen
      .interfaceBuilder('IExtendable')
      .markExport()
      .extends(
        tscgen.objectType({
          name: 'string',
        })
      )
      .addBody({
        name: tscgen.stringType('hello'),
      });

    const formatted = await tscgen.format(build.toString());
    expect(formatted).to.eq(
      `export interface IExtendable extends { name: string } {\n  name: 'hello';\n}\n`
    );
  });

  it('works with interface extends identifier', async () => {
    const parent = tscgen.interfaceBuilder('IParent').addBody({
      name: 'string',
    });
    const build = tscgen
      .interfaceBuilder('IExtendable')
      .markExport()
      .extends(tscgen.identifierType(parent))
      .addBody({
        name: tscgen.stringType('hello'),
        value: tscgen.readonly(
          tscgen.objectType({
            name: tscgen.stringType('world'),
          })
        ),
      });

    const formatted = await tscgen.format(tscgen.combine(parent, build));
    expect(formatted).to.eq(
      `interface IParent {\n  name: string;\n}\n\nexport interface IExtendable extends IParent {\n  name: 'hello';\n  value: Readonly<{ name: 'world' }>;\n}\n`
    );
  });

  it('readonly works', async () => {
    const build = tscgen
      .typeDefBuilder('TestReadonly')
      .markExport()
      .addUnion(
        tscgen.readonly(
          tscgen.objectType({
            name: 'string',
          })
        )
      );

    const formatted = await tscgen.format(tscgen.combine(build));
    expect(formatted).to.eq(
      `export type TestReadonly = Readonly<{ name: string }>;\n`
    );
  });

  it('extract works', async () => {
    const build = tscgen
      .typeDefBuilder('TestReadonly')
      .markExport()
      .addUnion(
        tscgen.extract(tscgen.stringType('a', 'b', 'c'), tscgen.stringType('a'))
      );

    const formatted = await tscgen.format(tscgen.combine(build));
    expect(formatted).to.eq(
      `export type TestReadonly = Extract<'a' | 'b' | 'c', 'a'>;\n`
    );
  });
});
