import path from 'path';
import * as tscgen from 'tscgen';

export const getStaticReference = (
  relative: string,
  callerPath: string,
  params: Record<string, string>
) => {
  const repl = Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`[${key}]`, value),
    callerPath
  );
  const basePath = path.resolve(callerPath, relative);
  const newPath = path.relative(repl, basePath);
  const importPath = newPath.replace('.static.ts', '');
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
