<h1>tscgen-framework</h1>

A framework for `tscgen` for creating code generation projects that are easy to maintain, update, and understand.

**Table of contents**

- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Setup](#setup)
- [Concepts](#concepts)
  - [Directory structure](#directory-structure)
  - [Static Files vs Single Exports vs Mapped Exports](#static-files-vs-single-exports-vs-mapped-exports)
  - [Registering exports](#registering-exports)
- [Sample Usage](#sample-usage)
  - [Output an interface](#output-an-interface)
  - [Reference a Static File with a Single Exports file](#reference-a-static-file-with-a-static-exports-file)
  - [A Mapped Export File](#a-mapped-export-file)
- [Documentation](#documentation)
  - [File types](#file-types)
    - [Static Files](#static-files)
    - [Single Export File](#single-export-file)
    - [Mapped Export File](#mapped-export-file)
  - [`tscgen.yaml`](#tscgenyaml)

## Getting Started

The easiest way to get started is with the
[`bootstrap`](../../README.md#creating-your-project) tool. The instructions below are
for setup in an existing project that already has `typescript` installed.

If you're setting up your project with the `bootstrap` tool, you can skip this section.

For an overview of how `tscgen-framework` works, see the [Concepts](#concepts) section.

### Installation

Install with NPM:

```bash
npm i -D tscgen tscgen-framework tscgen-cli
```

Install with Yarn:

```bash
yarn add --dev tscgen tscgen-framework tscgen-cli
```

### Setup

Create a  `tscgen.yaml` in your root directory with the following:

```yaml
outDir: out
projectDir: template
```

`tscgen` will build your project from the `projectDir` and generate the output in the `outDir`.

Add additional typescript configurations to your project:

```json
// tsconfig.tscgen.json
{
  "compilerOptions": {
    "strict": true,
    "target": "ESNext",
    "module": "CommonJS",
    "esModuleInterop": true,
    "lib": ["ES2020"],
    "noEmit": true,
    "resolveJsonModule": true
  },
  // include both the `projectDir` and `outDir`
  "include": ["template", "out"]
}
```

```json
// tsconfig.tscgen-build.json
{
  "extends": "./tsconfig.tscgen.json",
  "compilerOptions": {
    "noEmit": "false",
    "declaration": true,
    "outDir": "dist",
    "target": "ES5"
  },
  "include": ["out"]
}
```

Add the following commands to your `package.json`

```json
{
  "scripts": {
    "generate": "tscgen generate -p tsconfig.tscgen.json",
    "generate:build": "tsc -p tsconfig.tscgen-build.json"
  }
}
```

You can call `npm run generate` to generate the code output, and
`npm run generate:build` to transpile the generated code with `typescript`.

## Concepts

`tscgen-framework` aims to provide a declarative way to define both code AND
your code output directory structure.

### Directory structure

Every project structure for `tscgen` contains a `projectDir` and
an `outDir`. These are defined in the [tscgen.yaml](#tscgenyaml) file.

Each file in the `projectDir` is transpiled into a corresponding file
in the `outDir` - whatever is put into the `projectDir` is outputted as
a generated file as well.

### Static Files vs Single Exports vs Mapped Exports

There are 3 types of files that can be created inside your `projectDir`.

**1. Static Files** - Files that are copied from the `projectDir`
to `outDir` with no modifications. These files end in `.static.ts`.

**2. Single Exports** - Each `Single Export File` is generated into
an output file.

**3. Mapped Exports** - Each `Mapped Export File` can be generated into
multiple output files. It takes a list of inputs and generates an output
file for each input. These files are in a folder with a path param, or the filename itself contains a path param (i.e. `models/[name].ts` or `[path]/name.ts`) where `[]` in the file/folder name denotes a path param.

See [File Types](#file-types) for more detailed information or [Sample Usage](#sample-usage) for examples.

### Registering exports

For [Single Exports](#single-exports) and [Mapped Exports](#mapped-exports), the value of a module's default export is used to generate the corresponding output file.

The `default export` is constructed by:

1. [Registering](#register) a list of names

```typescript
import { register } from 'tscgen-framework';
import * as tscgen from 'tscgen';

const registeredNames = register('Colors', 'BlueColors', 'RedColors');
```

2. Specifying [inputs](#inputs) (for [Mapped Exports](#mapped-exports) only)
3. Assign each registered name to a [builder](#builders)

```typescript
export default registeredNames.generateExports(() => {
  const colors = []
  return {
    exports: {
      Colors: tscgen
        .typeAliasBuilder('Colors')
        .markExport()
        .addUnion(tscgen.stringType(''))
    }
  }
})
```

4. A list of [import builders](#import-builder) can be specified as well.

## Sample Usage

### Output an interface

```typescript
// <projectDir>/colors.ts

// this file is a Single Export File (it generates a `colors.ts` file in
// outDir by calculating the output of this file)
import tscgen from 'tscgen';
import { register } from 'tscgen-framework';

export const getPath = __filename;

export default register('IColor').generateExports(() => {
  return {
    exports: {
      IColor: tscgen
        .interfaceBuilder('IColor')
        .markExport()
        .addBody({
          name: stringType(),
          r: numberType(),
          g: numberType(),
          b: numberType(),
          a: numberType(),
        })
    }
  }
})

// <outDir>/colors.ts
export interface IColor {
  name: string;
  r: number;
  g: number;
  b: number;
  a: number;
}
```

### Reference a Static File with a Single Export File

```typescript
// <projectDir>/response.static.ts

// this file is a Static File (it gets copied to the output dir)
export interface Response {
  data: unknown;
}

// <projectDir>/errorResponse.ts

// this file is a Single Export File (it generates a `errorResponse.ts` file in
// outDir by calculating the output of this file)
import tscgen from 'tscgen';
import { register } from 'tscgen-framework';

export const getPath = __filename;

export default register('IErrorResponse').generateExports(() => {
  const Response = getStaticReference(
    './response.static.ts',
    getPath,
    params
  )
    .getReference('Response')
    .asInterface();


  return {
    imports: [Response.import],
    exports: {
      IErrorResponse: tscgen
        .interfaceBuilder('IErrorResponse')
        .markExport()
        .extends(Response.exports[0])
        .addBody({
          isError: tscgen.booleanType(true)
        })
    }
  }
})

//<outDir>/response.ts
export interface Response {
  data: unknown;
}

//<outDir>/errorResponse.ts
import { Response } from './response';

export interface IErrorResponse extends Response {
  isError: true
}
```

### A Mapped Export File

```typescript
// <projectDir>/models/[name].ts

// this file is a Mapped Export File - it takes in an array of inputs
// of type Array<{ data: T, params: Record<string, string> }>.
// For each input, it calculates the name of the output path by
// substituting the `params` into the path and injecting the data
// into the generateExports function

import tscgen from 'tscgen';
import { register } from 'tscgen-framework';

export const getPath = __filename;

const outputs = register('Model').withInputs(() => {
  const data = [
    { name: 'Car', type: 'Vehicle' },
    { name: 'Dog', type: 'Animal' },
    { name: 'Tulip' type: 'Flower' }
  ]

  return data.map(val => ({
    data: val,
    params: {
      name: `I${val.name}Model`
    }
  }))
})

export default outputs.generateExports(({ data, params }) => {
  return {
    exports: {
      Model: tscgen
        .interfaceBuilder(params.name)
        .markExport()
        .addBody({
          name: tscgen.stringType(data.name),
          type: tsgen.stringType(data.type)
        })
    }
  }
})

//<outDir>/models/ICarModel.ts
export interface ICarModel {
  name: 'Car';
  type: 'Vehicle';
}

//<outDir>/models/IDogModel.ts
export interface IDogModel {
  name: 'Dog';
  type: 'Animal';
}

//<outDir>/models/ITulipModel.ts
export interface IDogModel {
  name: 'Tulip';
  type: 'Flower';
}
```

## Documentation

### File types

### Export Files

These include both [Single Export Files](#single-export-file) & [Mapped Export File](mapped-export-file)

These files must:

- Export the path of the file in the current dir with a `getPath` export
- Provide a default export that tells the `tscgen` cli what to export.

#### The `getPath` Export

The `getPath` should be a constant assigned to a string. More specifically, it should be:

```typescript
export const getPath = __filename;
```

Each file needs a `getPath` export so that relative imports between `Export File`s can be resolved automatically when generating the code output.

#### The Default Export

The default export tells the `tscgen` CLI what code to actually process. The default export needs:

- A list of `routes` (a bunch of names that "hold" [builders](.))
- A mapping  of `routes` to `builders`.
- Optionally, a list of `imports` that should be included
- For [Mapped Export Files](#mapped-export-file), the [input function](#input-function).

#### Static Files

Static files are files that are copied from the `projectDir` to the `outDir` without any processing. Static files always end in the extension `.static.ts`. When copying static files, the `.static` extension in the filename is stripped (i.e. `<projectDir>/file.static.ts` -> `<outDir>/file.ts`)

Static files useful since it's not ideal to type to use the [builders](.) to output large amounts of code. It's much easier to understand and read code by itself.

- Use static files if a file you want "generated" doesn't rely on any inputs - you know what the contents of the file is going to be beforehand.
- You can use exports of [Static Files](#static-files) in [Single Export Files](#single-export-file) & [Mapped Export Files](#mapped-export-file).

#### Single Export File

Single Export Files are processed by `tscgen` and emit Typescript code in the project's `outDir`. A single export file has a one-to-one mapping relationship to its `outDir` (i.e: `<projectDir>/file.ts` -> `<outDir>/file.ts`)

#### Mapped Export File

### `tscgen.yaml`

The `tscgen.yaml` file is placed in the root of the directory (wherever `node_modules` is installed). When the `tscgen` cli runs, it looks for the `tscgen.yaml`. The only two fields are

- `projectDir` - the dir of where the project is located 
- `outDir` the dir where the output is stored