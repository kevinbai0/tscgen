import fs from 'fs';
import path from 'path';
import { expect } from 'chai';
import * as tscgen from '../src';

import { routes } from './config/sample';
import { Breadcrumb, Query } from './config/types';

describe('Generates routes correctly', () => {
  it('generates sample test correctly', async () => {
    function writeQueryBody(query: Query | undefined): tscgen.IBodyType {
      return tscgen.mapObject(query ?? {}, (value) => {
        const getValue = (val: 'string' | 'array') =>
          val === 'string' ? 'string' : tscgen.arrayType('string');

        const required = typeof value === 'string' ? false : !!value.required;
        return [
          typeof value === 'string' ? getValue(value) : getValue(value.type),
          required,
        ];
      });
    }

    function writeBreadcrumbs(breadcrumbs: Breadcrumb): tscgen.IBodyType {
      if (breadcrumbs.root) {
        return {
          params: tscgen.literalTupleType(),
          template: tscgen.literalType(''),
          dependsOn: tscgen.literalTupleType(''),
        };
      }

      return {
        params: tscgen.literalTupleType(
          ...(breadcrumbs.dynamic ? breadcrumbs.params : [])
        ),
        dependsOn: tscgen.literalTupleType(...breadcrumbs.dependsOn),
        template: tscgen.literalType(
          breadcrumbs.dynamic ? breadcrumbs.template : breadcrumbs.name
        ),
      };
    }

    const builders = Object.entries(routes).map(([name, route]) => {
      return tscgen.interfaceBuilder(`I${name}Page`).addBody({
        name: tscgen.literalType(name),
        route: tscgen.literalType(route.route),
        params: route.params
          ? tscgen.literalTupleType(...route.params)
          : 'undefined',
        query: tscgen.objectType(writeQueryBody(route.query)),
        breadcrumbs: tscgen.objectType(writeBreadcrumbs(route.breadcrumb)),
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
});
