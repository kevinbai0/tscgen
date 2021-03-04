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

const format = tscgen.createFormatter(
  path.resolve(__dirname, '../src/index.ts')
);

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

    const output = await format(
      tscgen.combine(...builders, routesType, routeType)
    );
    expect(output).equal(sampleOutput);
  });

  it('works with interface extends inline object', async () => {
    const build = tscgen
      .interfaceBuilder('IExtendable')
      .markExport()
      .extends({
        type: 'identifier',
        definition: 'object',
      })
      .addBody({
        name: tscgen.stringType('hello'),
      });

    const formatted = await format(build.toString());
    expect(formatted).to.eq(
      `export interface IExtendable extends object {\n  name: 'hello';\n}\n`
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

    const formatted = await format(tscgen.combine(parent, build));
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

    const formatted = await format(tscgen.combine(build));
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

    const formatted = await format(tscgen.combine(build));
    expect(formatted).to.eq(
      `export type TestReadonly = Extract<'a' | 'b' | 'c', 'a'>;\n`
    );
  });

  it('union types', async () => {
    const union = tscgen.unionType([
      tscgen.objectType({
        name: 'string',
      }),
      tscgen.objectType({
        name: 'boolean',
      }),
    ]);

    const res = await format(
      tscgen.combine(
        tscgen.typeDefBuilder('Test').addUnion(union),
        tscgen.typeDefBuilder('Empty').addUnion(tscgen.unionType([]))
      )
    );
    expect(res).to.equal(
      `type Test = { name: string } | { name: boolean };\n\ntype Empty = never;\n`
    );
  });

  it('generics types', async () => {
    const ResponseMessage = tscgen
      .typeDefBuilder('ResponseMessage')
      .addGeneric('T')
      .addUnion(
        tscgen.objectType({
          success: tscgen.booleanType(true),
          status: tscgen.numberType(),
          data: {
            type: 'identifier',
            definition: 'T',
          },
        })
      )
      .addUnion(
        tscgen.objectType({
          success: tscgen.booleanType(false),
          status: tscgen.numberType(),
          error: tscgen.stringType(),
        })
      );

    const res = await format(tscgen.combine(ResponseMessage));
    expect(res).to.equal(
      `type ResponseMessage<T> =\n  | { success: true; status: number; data: T }\n  | { success: false; status: number; error: string };\n`
    );
  });
});
