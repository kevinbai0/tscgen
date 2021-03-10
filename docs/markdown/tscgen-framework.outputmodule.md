<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [tscgen-framework](./tscgen-framework.md) &gt; [OutputModule](./tscgen-framework.outputmodule.md)

## OutputModule type

<b>Signature:</b>

```typescript
export declare type OutputModule<Inputs extends GetInputs = GetInputs, MappedExports extends ReadonlyArray<string> = ReadonlyArray<string>, StaticExports extends ReadonlyArray<string> = ReadonlyArray<string>, StaticBuilders extends BuilderExports<StaticExports> = BuilderExports<StaticExports>, Unpromise extends boolean = false> = {
    getStaticExports?: GetStaticExports<StaticExports, StaticBuilders>;
    getPath: string;
    getMappedExports?: GetMappedExports<Inputs, MappedExports, Unpromise>;
    getInputs?: Inputs;
};
```
<b>References:</b> [GetInputs](./tscgen-framework.getinputs.md)<!-- -->, [BuilderExports](./tscgen-framework.builderexports.md)<!-- -->, [GetStaticExports](./tscgen-framework.getstaticexports.md)<!-- -->, [GetMappedExports](./tscgen-framework.getmappedexports.md)
