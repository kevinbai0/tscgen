import * as tscgen from '../../src/framework';
import { getInputs } from './routes/[route]';

export const getPath = __filename;

export const getStaticExports = tscgen.createStaticExports(async () => {
  const references = await tscgen.getReference(
    import('./routes/[route]'),
    __filename
  );
  const { imports, exports } = await references.referenceMappedExports({
    pick: ([val]) => val,
  });

  const pathsData = await getInputs();

  const routesDataBase = tscgen
    .varObjectBuilder('routesData')
    .addTypeDef(
      tscgen.objectType({
        [`[Key in keyof Routes]`]: tscgen.objectType({
          route: tscgen.rawType(`Routes[Key]['path']`),
          method: tscgen.rawType(`Routes[Key]['method']`),
        }),
      })
    )
    .markExport();
  const routesData = pathsData.reduce(
    (acc, data) =>
      acc.addBody({
        [data.params.route!]: tscgen.objectValue({
          route: data.data.route,
          method: data.data.pathInfo.method,
        }),
      }),
    routesDataBase
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
      routesData,
    ],
  };
});
