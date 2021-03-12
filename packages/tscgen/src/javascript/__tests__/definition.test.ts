import { expect } from 'chai';
import { objectValue } from '../definitions';
import { variableBuilder } from 'src/core/builders/variableBuilder';
import { arrayType, numberType, objectType } from 'src/typescript/definitions';

describe('writes javascript object code', () => {
  it('works', async () => {
    const output = variableBuilder('test')
      .setLevel('const')
      .markExport()
      .setAssignment('Hello');
    expect(output.toString()).to.equal("export const test = 'Hello'");
  });

  it('works with type definitions', () => {
    const output = variableBuilder('test')
      .setLevel('const')
      .markExport()
      .addTypeAlias(
        objectType({
          cool: arrayType(numberType()),
        })
      )
      .setAssignment(
        objectValue({
          cool: [5, 6, 7, 8],
        })
      );

    expect(output.toString()).to.equal(
      'export const test: {cool: number[]} = {cool: [5,6,7,8]}'
    );
  });
});
