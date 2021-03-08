import { expect } from 'chai';
import * as tscgen from '../lib';
import { UseInterface } from '.';

describe('Test that types are properly generated without compile time errors', () => {
  it('Basic interface', () => {
    const TestInterface = tscgen.interfaceBuilder('Test').addBody({
      value: tscgen.stringType(),
      array: tscgen.arrayType(tscgen.stringType()),
      union: (() => tscgen.stringType('Hello', 'World'))(),
      tuple: (() => tscgen.numberTuple(1, 2, 3, 4))(),
    });

    const test: UseInterface<typeof TestInterface> = {
      array: ['I', 'am', 'an', 'array'],
      value: 'Value string',
      union: 'Hello',
      tuple: [1, 2, 3, 4],
    };

    expect(test).equal(test);
  });
});
