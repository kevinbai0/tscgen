<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [tscgen-framework](./tscgen-framework.md) &gt; [OutputType](./tscgen-framework.outputtype.md)

## OutputType type

<b>Signature:</b>

```typescript
export declare type OutputType<Routes extends ReadonlyArray<string>, Inputs extends GetInputs | undefined> = {
    routes: Routes;
    inputs: Inputs;
    getExports: Inputs extends GetInputs ? GetMappedExports<Inputs, Routes> : () => Promiseable<BuilderExports<Routes, true>>;
};
```
<b>References:</b> [GetInputs](./tscgen-framework.getinputs.md)<!-- -->, [GetMappedExports](./tscgen-framework.getmappedexports.md)<!-- -->, [Promiseable](./tscgen.promiseable.md)<!-- -->, [BuilderExports](./tscgen-framework.builderexports.md)

