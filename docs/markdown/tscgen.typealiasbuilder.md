<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [tscgen](./tscgen.md) &gt; [typeAliasBuilder](./tscgen.typealiasbuilder.md)

## typeAliasBuilder() function

<b>Signature:</b>

```typescript
export declare function typeAliasBuilder<Name extends string, Generics extends Readonly<IGenericValue<string, IGenericOptions>[]> = [], JoinedTypes extends ReadonlyArray<{
    type: IType;
    joinType: 'union' | 'intersection';
}> = [], Exported extends boolean = false>(name: Name, defaultOptions?: {
    generics?: Generics;
    export: boolean;
    types?: JoinedTypes;
}): ITypeAliasBuilder<Name, Generics, JoinedTypes, Exported>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  name | Name |  |
|  defaultOptions | { generics?: Generics; export: boolean; types?: JoinedTypes; } |  |

<b>Returns:</b>

[ITypeAliasBuilder](./tscgen.itypealiasbuilder.md)<!-- -->&lt;Name, Generics, JoinedTypes, Exported&gt;

