import { register, registerAll, writeApplication } from 'tscgen-framework';
import { allRoutes } from './project/allRoutes';
import { endpoints } from './project/endpoints';
import { models } from './project/models';
import { routes } from './project/routes';
import { getPaths, getSchemas } from './schema/data';

export const createRequestComponent = register('createRequest.ts').setSource(
  'src/project/request.static.ts'
);

export const responseMessageComponent = register(
  'ResponseMessage.ts'
).setSource('src/project/ResponseMessage.static.ts');

const promise = registerAll(
  models,
  routes,
  endpoints,
  allRoutes,
  Promise.resolve(createRequestComponent),
  Promise.resolve(responseMessageComponent)
);

const schemas = getSchemas();

export const app = promise.setInputs({
  'models/[name].ts': schemas.map((val) => ({
    data: val,
    params: { name: val.name },
  })),
  'routes/[route].ts': getPaths().map((path) => ({
    data: path,
    params: {
      route: path.pathInfo.operationId!,
    },
  })),
  'api/[path]/[endpoint].ts': getPaths().map((path) => ({
    data: path,
    params: {
      path: path.route.replace(/[{}]/g, ''),
      endpoint: path.pathInfo.method,
    },
  })),
});

export type App = typeof app;

async function main() {
  const val = await app;
  await writeApplication(val);
}
main().catch(console.error);
