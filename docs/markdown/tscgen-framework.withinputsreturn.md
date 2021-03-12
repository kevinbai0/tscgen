<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [tscgen-framework](./tscgen-framework.md) &gt; [WithInputsReturn](./tscgen-framework.withinputsreturn.md)

## WithInputsReturn type

<b>Signature:</b>

```typescript
export declare type WithInputsReturn<Routes extends ReadonlyArray<string>, Inputs extends GetInputs> = {
    generateExports: (method: GetMappedExportsBase<Inputs, Routes>) => Promiseable<OutputType<Routes, Inputs>>;
};
```
<b>References:</b> [GetInputs](./tscgen-framework.getinputs.md)<!-- -->, [GetMappedExportsBase](./tscgen-framework.getmappedexportsbase.md)<!-- -->, [Promiseable](./tscgen.promiseable.md)<!-- -->, [OutputType](./tscgen-framework.outputtype.md)
