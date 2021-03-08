import * as tscgen from 'tscgen';
import { createStaticExports, getReference } from 'tscgen-framework';
import { getInputs } from './routes/[route]';

export const getPath = __filename;

export const getStaticExports = createStaticExports(
  'Route',
  'Routes',
  'RoutesData',
  'routesData'
)(async () => {
  const references = await getReference(import('./routes/[route]'), __filename);
  const { imports, exports } = await references
    .referenceMappedExports('route')
    .filter(() => true);

  const pathsData = await getInputs();

  return {
    imports,
    exports: {
      Route: tscgen
        .typeDefBuilder('Route')
        .markExport()
        .addUnion(...exports.map((builder) => tscgen.identifierType(builder))),
      Routes: tscgen
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
      RoutesData: tscgen
        .typeDefBuilder('RoutesData')
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
          .varObjectBuilder('routesData')
          .markExport()
          .addTypeDef(tscgen.identifierType(this.RoutesData))
          .addBody(
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
          );
      },
    },
  };
});
