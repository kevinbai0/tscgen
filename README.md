# tscgen

A collection of tools for Typescript code generation.

## Goals

To simplify code generation by declaring/writing interfaces, types, and variables declaratively in Typescript.

- Generate type definitions and Javascript objects based on JSON/YAML files or any other data source.
- Make it easy to take advantage code generation to type data in projects without overly complex generics and type annotations
- Make maintaining, updating, and updating generated code in projects easy

## Projects

The `tscgen` monorepo a number of different projects and packages which are located under the `packages` folder.

| Project        | Description           |
| :------------- |:-------------|
| [tscgen](./packages/tscgen/README.md)     | The core package for constructing & writing Typescript interfaces, type alises, and JS Objects |
| [tscgen-framework](./packages/framework/README.md)      | A small framework for structuring, processing, and outputting code-generation projects.      |
| [tscgen-cli](./packages/cli/README.md) | CLI-tool that interfaces with [tscgen-framework](./packages/framework/README.md) to build projects.     |  

### [API Reference](docs/markdown/index.md)
