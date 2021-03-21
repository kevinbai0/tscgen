import * as tscgen from 'tscgen';
import { register } from 'tscgen-framework';
import { routes } from './routes';

export const allRoutes = register('routes.ts').generate(async ({ context }) => {
  const { imports, entities, inputData } = await context.getGlobalReference(
    routes,
    ['route'],
    () => true
  );

  return {
    imports,
    exports: {
      Route: tscgen
        .typeAliasBuilder('Route')
        .markExport()
        .addUnion(...entities.map((builder) => tscgen.identifierType(builder))),
      Routes: tscgen
        .typeAliasBuilder('Routes')
        .markExport()
        .addUnion(
          tscgen.toObjectType([...entities], (value) => {
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
              inputData.reduce(
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
