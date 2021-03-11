# tscgen-framework

Framework for creating code generation projects that are easy to maintain, update, and understand.

## Installation

Install with NPM:

```bash
npm i -D tscgen-framework tscgen-cli
```

Install with Yarn:

```bash
yarn add --dev tscgen-framework tscgen-cli
```

## Getting Started

Create a  `tscgen.yaml` in your root directory.

```yaml
outDir: dist
projectDir: src
```

`tscgen` will build your project from the `projectDir` and generate the output in the `outDir`.

Each file in `projectDir` gets processed and generated as a corresponding typescript generated file in the `outDir`.

## Documentation

### Project Setup Guide

#### 1. Standalone Projects

NPM Scripts:

```json
{
  "scripts": {
    "generate": "tscgen generate",
    "build": "tsc"
  }
}
```

#### 2. Subfolder
