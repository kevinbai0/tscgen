import path from 'path';
import { expect } from 'chai';
import * as tscgen from '../src/lib';
const format = tscgen.createFormatter(
  path.resolve(__dirname, '../src/lib/index.ts')
);

describe('writes javascript object code', () => {
  it('works', async () => {
    const output = tscgen
      .varObjectBuilder('test')
      .setLevel('const')
      .markExport()
      .addBody({
        name: tscgen.primitiveValue('Hello'),
      });
    const formatted = await format(output.toString());
    expect(formatted).to.equal(`export const test = { name: 'Hello' };\n`);
  });
  it('works with type definitions', async () => {
    const output = tscgen
      .varObjectBuilder('test')
      .setLevel('const')
      .markExport()
      .addTypeDef(
        tscgen.objectType({
          cool: tscgen.arrayType(tscgen.numberType()),
        })
      )
      .addBody({
        cool: tscgen.arrayValue(...[5, 6, 7, 8].map(tscgen.primitiveValue)),
      });

    const formatted = await format(output.toString());
    expect(formatted).to.equal(
      `export const test: { cool: number[] } = { cool: [5, 6, 7, 8] };\n`
    );
  });
});
