import fs from 'fs';
import path from 'path';
import { expect } from 'chai';
import * as tscodegen from '../src';

import { routes } from './config/sample';
import { Breadcrumb, Query } from './config/types';

describe('Generates routes correctly', () => {
  it('generates sample test correctly', async () => {
    function writeQueryBody(query: Query | undefined): tscodegen.IBodyType {
      return tscodegen.mapObject(query ?? {}, (value) => {
        const getValue = (val: 'string' | 'array') =>
          val === 'string' ? 'string' : tscodegen.arrayType('string');

        const required = typeof value === 'string' ? false : !!value.required;
        return [
          typeof value === 'string' ? getValue(value) : getValue(value.type),
          required,
        ];
      });
    }

    function writeBreadcrumbs(breadcrumbs: Breadcrumb): tscodegen.IBodyType {
      if (breadcrumbs.root) {
        return {
          params: tscodegen.literalTupleType(),
          template: tscodegen.literalType(''),
          dependsOn: tscodegen.literalTupleType(''),
        };
      }

      return {
        params: tscodegen.literalTupleType(
          ...(breadcrumbs.dynamic ? breadcrumbs.params : [])
        ),
        dependsOn: tscodegen.literalTupleType(...breadcrumbs.dependsOn),
        template: tscodegen.literalType(
          breadcrumbs.dynamic ? breadcrumbs.template : breadcrumbs.name
        ),
      };
    }

    const builders = Object.entries(routes).map(([name, route]) => {
      return tscodegen.interfaceBuilder(`I${name}Page`).addBody({
        name: tscodegen.literalType(name),
        route: tscodegen.literalType(route.route),
        params: route.params
          ? tscodegen.literalTupleType(...route.params)
          : 'undefined',
        query: tscodegen.objectType(writeQueryBody(route.query)),
        breadcrumbs: tscodegen.objectType(writeBreadcrumbs(route.breadcrumb)),
      });
    });
    const routesType = tscodegen
      .typeDefBuilder('Routes')
      .addUnion(
        ...builders.map((builder) => tscodegen.identifierType(builder))
      );
    const routeType = tscodegen
      .typeDefBuilder('Route')
      .addUnion(
        tscodegen.identifierType(
          routesType,
          tscodegen.keyOfExtractor(routesType)
        )
      );

    const sampleOutput = await fs.promises.readFile(
      path.join(__dirname, 'config/output.snapshot.ts'),
      'utf-8'
    );

    const output = await tscodegen.format(
      tscodegen.combine(...builders, routesType, routeType)
    );
    expect(output).equal(sampleOutput);
  });
});
