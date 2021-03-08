import { expect } from 'chai';
import * as tscgen from '../src/index';

describe('writes javascript object code', () => {
  it('works', async () => {
    const output = tscgen
      .varObjectBuilder('test')
      .setLevel('const')
      .markExport()
      .addBody({
        name: 'Hello',
      });
    expect(output.toString()).to.equal("export const test = {name: 'Hello'}");
  });

  it('works with type definitions', () => {
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
        cool: [5, 6, 7, 8],
      });

    expect(output.toString()).to.equal(
      'export const test: {cool: number[]} = {cool: [5,6,7,8]}'
    );
  });
});
