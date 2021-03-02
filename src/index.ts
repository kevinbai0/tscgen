import { format } from './builders/format';
import { interfaceBuilder } from './builders/interface';
import { typeDefBuilder } from './builders/typeDef';
import { IBaseBuilder } from './builders/types';
import {
  buildArrayType,
  buildLiteralTupleType,
  buildLiteralType,
  buildLiteralUnionType,
  buildObjectType,
} from './typeBuilders';

main().catch(console.error);

function combine(...builders: IBaseBuilder[]): string {
  return builders.map((builder) => builder.toString()).join('\n\n');
}

async function main(): Promise<void> {
  const i1 = interfaceBuilder('ITest')
    .addGenerics(['T', { extendsValue: 'string' }])
    .addBody({
      name: 'string',
      type: buildLiteralUnionType('hello', 'world'),
      route: buildLiteralType('/users'),
      params: buildArrayType('string'),
    });
  const i2 = interfaceBuilder('I2').addBody({
    age: buildLiteralUnionType(1, 2, 3, 4),
  });

  const t1 = typeDefBuilder('CoolType').addUnion(buildLiteralType('hello'));
  const t2 = typeDefBuilder('CoolType2')
    .addUnion(
      buildObjectType({
        test: 'string',
        stuff: buildLiteralTupleType('cool', 'stuff'),
      })
    )
    .addUnion(
      buildObjectType({
        test: 'boolean',
        stuff: 'number',
      })
    );

  console.log(await format(combine(i1, i2, t1, t2)));
}
