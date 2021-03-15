<h1 align="center">
  tscgen
</h1>

<div align="center">
<em>A (WIP) collection of tools for Typescript code generation.</em>
</div>

<hr style="background-color: #555555; height: 1px;" />

- [Why?](#why)
- [Goals](#goals)
- [Sample Usage](#sample-usage)
- [Projects](#projects)
- [Getting Started](#getting-started)
  - [Creating your project](#creating-your-project)
  - [Build your project](#build-your-project)
- [Documentation](#documentation)
  - [tscgen-framework](#tscgen-framework)
  - [tscgen](#tscgen)

*Note: The docs for this project are still incomplete and likely to change*

## Why?

- Code generation is an extremely powerful tool but it's hard to leverage unless there's an off-the-shelf solution readily available.
- It's really hard to create your own code generation pipeline that isn't a jumble of string concatenation and messy logic.
- It takes a lot of time to create and maintain code generation projects

## Goals

Simplify Typescript code generation by defining interfaces, types, and variables declaratively.

- Generate type definitions and Javascript objects based on JSON/YAML files or any other data source.
- Make it easy to use custom code generation in any project.
- Make maintaining, updating, and understanding code generation projects easy.

## Sample Usage

```ts
import tscgen from 'tscgen';

const ISampleInterface = tscgen
  .interfaceBuilder('ISampleInterface')
  .markExport()
  .addBody({
    type: tscgen.stringType(),
    data: tscgen.numberType(1, 2, 3, 4)
    inputs: tscgen.booleanTuple(true, false)
  });

console.log(ISampleInterface.toString());

// output (after linted)

export interface ISampleInterface {
  type: string;
  data: 1 | 2 | 3 | 4;
  inputs: [true, false]
}
```

## Projects

The `tscgen` monorepo contains a number of different projects and packages which are located under the `packages` folder.

| Project        | Description           |
| :------------- |:-------------|
| [tscgen](./packages/tscgen/README.md)     | The core package for constructing type definitions and variables declaratively |
| [tscgen-framework](./packages/framework/README.md)      | A small framework for building & maintaining code-generation projects.      |
| [tscgen-cli](./packages/cli/README.md) | CLI-tool for [tscgen-framework](./packages/framework/README.md) to build code-generation projects.     |
[tscgen-bootstrap](./packages/tscgen-bootstrap/README.md) | A `create-react-app`-like tool for bootstrappin a `tscgen-framework` project     |
[framework-example](./packages/framework-example/README.md) | An example project that parses OpenAPI3 spec and generates FE code.    |

## Getting Started

The `tscgen-framework` is by far the best & easiest way to create useful code generation projects. If you only want to generate a few `interfaces` or `types`, refer to the core [tscgen](./packages/tscgen/README.md) package.

There are 2 primary types of projects for code generation:

1) Standalone project to be published as a package (other projects consume this package).
2) As a subfolder inside of a single-project directory

For the Getting Started Guide, we'll assume that you're creating a standalone project.

### Creating your project

With `npx` (recommended)

```bash
npx tscgen-bootstrap -p my-project
```

This configures everything you need for your project including `typescript`, `eslint`, npm scripts, `tscgen` dependencies, and your initial project setup.

### Build your project

Generate code into the `./out` folder

```bash
npm run generate
```

Compile your `./out` folder to `./dist` with `typescript`

```bash
npm run build
```

## Documentation

This section outlines detailed usage of both `tscgen` and `tscgen-framework`. A complete overview of the API can be found at the [API Reference](docs/markdown/index.md).

### tscgen-framework

[Docs](./packages/framework/README.md)

### tscgen

[Docs](./packages/tscgen/README.md)
