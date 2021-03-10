# tscgen

The core tscgen library for constructing and writing `interfaces`, `type aliases`, and `javascript objects`.

## Installation

Install with NPM:

```npm i -D tscgen```

Install With Yarn:

```yarn add --dev tscgen```

## Usage

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
