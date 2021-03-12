import * as tscgen from 'tscgen';

export const getStaticReference = (relative: string) => {
  const importPath = relative.replace('.static.ts', '');
  return {
    getReference: <Routes extends ReadonlyArray<string>>(...values: Routes) => {
      return {
        asTypeAlias() {
          const exportValue = (values.map((value) =>
            tscgen.typeAliasBuilder(value)
          ) as unknown) as MapToEntityBuilder<Routes>;

          return {
            exports: exportValue,
            import: tscgen
              .importBuilder()
              .addModules(...exportValue)
              .addImportLocation(importPath),
          };
        },
        asInterface() {
          const exportValue = (values.map((value) =>
            tscgen.interfaceBuilder(value)
          ) as unknown) as MapToEntityBuilder<Routes>;

          return {
            exports: exportValue,
            import: tscgen
              .importBuilder()
              .addModules(...exportValue)
              .addImportLocation(importPath),
          };
        },
        asVariable() {
          const exportValue = (values.map((value) =>
            tscgen.typeAliasBuilder(value)
          ) as unknown) as MapToEntityBuilder<Routes>;

          return {
            exports: exportValue,
            import: tscgen
              .importBuilder()
              .addModules(...exportValue)
              .addImportLocation(importPath),
          };
        },
      };
    },
  };
};

type MapToEntityBuilder<T> = {
  [Key in keyof T]: T[Key] extends string
    ? tscgen.IEntityBuilder<tscgen.IEntityBuilderTypes, T[Key]>
    : never;
};
