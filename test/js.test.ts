import { expect } from 'chai';
import * as tscgen from '../src';

describe('writes javascript object code', () => {
  it('works', async () => {
    const output = tscgen
      .varObjectBuilder('test')
      .setLevel('const')
      .markExport()
      .addBody({
        name: tscgen.primitiveValue('Hello'),
      });
    const formatted = await tscgen.format(output.toString());
    expect(formatted).to.equal(`export const test = { name: 'Hello' };\n`);
  });
  it('works with type definitions', async () => {
    const output = tscgen
      .varObjectBuilder('test')
      .setLevel('const')
      .markExport()
      .addTypeDef(
        tscgen.objectType({
          cool: tscgen.arrayType('number'),
        })
      )
      .addBody({
        cool: tscgen.arrayValue(...[5, 6, 7, 8].map(tscgen.primitiveValue)),
      });

    const formatted = await tscgen.format(output.toString());
    console.log(formatted);
    expect(formatted).to.equal(
      `export const test: { cool: number[] } = { cool: [5, 6, 7, 8] };\n`
    );
  });
});
