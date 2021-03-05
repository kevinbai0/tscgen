import * as tscgen from '../../src/framework';

export const getPath = __filename;

export const getStaticExports = tscgen.createStaticExports(async () => {
  const references = await tscgen.getReference(
    import('./models/[name]'),
    __filename
  );
  const { imports, exports } = await references.referenceMappedExports(
    ([val]) => val
  );

  return {
    imports,
    exports: [
      tscgen
        .typeDefBuilder('Route')
        .markExport()
        .addUnion(...exports.map((builder) => tscgen.identifierType(builder))),
      tscgen
        .typeDefBuilder('Routes')
        .markExport()
        .addUnion(
          tscgen.toObjectType(exports, (value) => {
            return {
              key: value.varName,
              value: tscgen.identifierType(value),
            };
          })
        ),
    ],
  };
});
