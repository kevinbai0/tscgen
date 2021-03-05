import * as tscgen from '../../src/framework';

export const getPath = __filename;

export const getStaticExports = tscgen.createStaticExports(async () => {
  const references = await tscgen.getReference(
    import('./models/[name]'),
    getPath
  );
  const mappedExports = await references.referenceMappedExports(([val]) => val);

  return [
    ...mappedExports.imports,
    tscgen
      .typeDefBuilder('Route')
      .markExport()
      .addUnion(
        ...mappedExports.exports.map((builder) =>
          tscgen.identifierType(builder)
        )
      ),
    tscgen
      .typeDefBuilder('Routes')
      .markExport()
      .addUnion(
        tscgen.toObjectType(mappedExports.exports, (value) => {
          return {
            key: value.varName,
            value: tscgen.identifierType(value),
          };
        })
      ),
  ];
});
