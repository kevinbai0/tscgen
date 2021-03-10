# tscgen

A collection of tools for Typescript code generation.

## Goals

To simplify code generation by declaring/writing interfaces, types, and variables declaratively in Typescript.

- Generate type definitions and Javascript objects based on JSON/YAML files or any other data source.
- Make it easy to take advantage code generation to type data in projects without overly complex generics and type annotations
- Make maintaining, updating, and updating generated code in projects easy

## Simple sample usage

### Creating an interface

```ts
import tscgen from 'tscgen';

const ISampleInterface = tscgen
  .interfaceBuilder('ISampleInterface')
  .markExport()
  .addBody({
    type: tscgen.stringType(),
    data: tscgen.numberType(1, 2, 3, 4)
    inputs: tscgen.booleanTuple(true, false)
  })

console.log(ISampleInterface.toString());

// output (after linted)

export interface ISampleInterface {
  type: string;
  data: 1 | 2 | 3 | 4;
  inputs: [true, false]
}
```

### Creating a Type Alias

```ts
import tscgen from 'tscgen';

const TestAlias = tscgen
  .typeDefBuilder('TestAlias')
  .addUnion(
    tscgen.arrayType(tscgen.stringType())
  )
  .addUnion(
    tscgen.stringType('none')
  )

console.log(TestAlias.toString());

// output (after linted)

type TestAlias = Array<string> | 'none';
```

### [API Reference](docs/markdown/index.md)
