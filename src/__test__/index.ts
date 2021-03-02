import { format } from '../builders/format';
import { interfaceBuilder } from '../builders/interface';
import { typeDefBuilder } from '../builders/typeDef';
import { IBaseBuilder } from '../builders/types';
import {
  buildArrayType,
  buildIdentifierType,
  buildLiteralTupleType,
  buildLiteralType,
  buildObjectType,
} from '../typeBuilders';
import { IBodyType } from '../types';
import { routes } from './sample';
import { Breadcrumb, Query } from './types';

function writeQueryBody(query: Query | undefined): IBodyType {
  return Object.entries(query ?? {}).reduce<IBodyType>((acc, [key, value]) => {
    const getValue = (val: 'string' | 'array') =>
      val === 'string' ? 'string' : buildArrayType('string');
    const required = typeof value === 'string' ? false : !!value.required;
    return {
      ...acc,
      [key]: [
        typeof value === 'string' ? getValue(value) : getValue(value.type),
        required,
      ],
    };
  }, {});
}

function writeBreadcrumbs(breadcrumbs: Breadcrumb): IBodyType {
  if (breadcrumbs.root) {
    return {
      params: buildLiteralTupleType(),
      template: buildLiteralType(''),
      dependsOn: buildLiteralTupleType(),
    };
  }

  return {
    params: buildLiteralTupleType(
      ...(breadcrumbs.dynamic ? breadcrumbs.params : [])
    ),
    dependsOn: buildLiteralTupleType(...breadcrumbs.dependsOn),
    template: buildLiteralType(
      breadcrumbs.dynamic ? breadcrumbs.template : breadcrumbs.name
    ),
  };
}

const builders = Object.entries(routes).map(([name, route]) => {
  return interfaceBuilder(`I${name}Page`).addBody({
    name: buildLiteralType(name),
    route: buildLiteralType(route.route),
    params: route.params ? buildLiteralTupleType(...route.params) : 'undefined',
    query: buildObjectType(writeQueryBody(route.query)),
    breadcrumbs: buildObjectType(writeBreadcrumbs(route.breadcrumb)),
  });
});

main().catch(console.error);

function combine(...builders: IBaseBuilder[]): string {
  return builders.map((builder) => builder.toString()).join('\n\n');
}

async function main() {
  const builder = typeDefBuilder('Routes');
  const routes = builders.reduce(
    (acc, curr) => acc.addUnion(buildIdentifierType(curr)),
    builder
  );
  console.log(await format(combine(...builders, routes)));
}
