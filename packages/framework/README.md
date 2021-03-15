<h1>tscgen-framework</h1>

A framework for `tscgen` for creating code generation projects that are easy to maintain, update, and understand.

**Table of contents**

- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Setup](#setup)
- [Concepts](#concepts)
  - [Directory structure](#directory-structure)
  - [Static Files vs Static Exports vs Mapped Exports](#static-files-vs-static-exports-vs-mapped-exports)
  - [Registering exports](#registering-exports)
- [Sample Usage](#sample-usage)
  - [Output an interface](#output-an-interface)
  - [Reference a static file](#reference-a-static-file)
- [Documentation](#documentation)
  - [File types](#file-types)
    - [Static Files](#static-files)
  - [`tscgen.yaml`](#tscgenyaml)
  - [Project Setup Guide](#project-setup-guide)
    - [1. Standalone Projects](#1-standalone-projects)
    - [2. Subfolder](#2-subfolder)

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

### Static Files vs Static Exports vs Mapped Exports

There are 3 types of files that can be created inside your `projectDir`.

**1. Static Files** - Files that are copied from the `projectDir`
to `outDir` with no modifications. These files end in `.static.ts`.

**2. Static Exports** - Each `Static Export File` is generated into
an output file.

**3. Mapped Exports** - Each `Mapped Export File` can be generated into
multiple output files. It takes a list of inputs and generates an output
file for each input.

See [File Types](#file-types) for usage of the files.

### Registering exports

For [Static Exports](#static-exports) and [Mapped Exports](#mapped-exports), the value of the `default export` is used to generate the corresponding output file.

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
import tscgen from 'tscgen';
import { register } from 'tscgen-framework';

export const getPath = __filename;

export default register('IColor').generateOutput(() => {
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

### Reference a static file

```typescript
// <projectDir>/response.static.ts
export interface Response<T> {
  data: T
}

// <projectDir>/errorResponse.ts
import tscgen from 'tscgen';
import { register } from 'tscgen-framework';

export const getPath = __filename;

export default register('IErrorResponse').generateOutput(() => {
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

## Documentation

### File types

#### Static Files

Declare with `<filename>.static.ts`

### `tscgen.yaml`

### Project Setup Guide

#### 1. Standalone Projects

#### 2. Subfolder
