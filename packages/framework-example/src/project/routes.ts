import * as tscgen from 'tscgen';
import { getReference, register } from 'tscgen-framework';

export const getPath = __filename;

const outputs = register('Route', 'Routes', 'RoutesData', 'routesData');

export default outputs.generateExports(async () => {
  const references = await getReference(
    import('./routes/[route]'),
    __filename,
    {}
  );
  const { imports, exports } = await references
    .referenceExports('route')
    .filter(() => true);

  const pathsData = await references.referenceInputs();

  return {
    imports,
    exports: {
      Route: tscgen
        .typeAliasBuilder('Route')
        .markExport()
        .addUnion(...exports.map((builder) => tscgen.identifierType(builder))),
      Routes: tscgen
        .typeAliasBuilder('Routes')
        .markExport()
        .addUnion(
          tscgen.toObjectType([...exports], (value) => {
            return {
              key: value.varName,
              value: tscgen.identifierType(value),
            };
          })
        ),
      RoutesData: tscgen
        .typeAliasBuilder('RoutesData')
        .addUnion(
          tscgen.objectType({
            [`[Key in keyof Routes]`]: tscgen.objectType({
              route: tscgen.rawType(`Routes[Key]['path']`),
              method: tscgen.rawType(`Routes[Key]['method']`),
            }),
          })
        )
        .markExport(),
      get routesData() {
        return tscgen
          .variableBuilder('routesData')
          .markExport()
          .addTypeAlias(tscgen.identifierType(this.RoutesData))
          .setAssignment(
            tscgen.objectValue(
              pathsData.reduce(
                (acc, data) => ({
                  ...acc,
                  [data.params.route]: tscgen.objectValue({
                    route: data.data.route,
                    method: data.data.pathInfo.method,
                  }),
                }),
                {}
              )
            )
          );
      },
    },
  };
});
