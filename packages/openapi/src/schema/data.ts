import fs from 'fs';
import path from 'path';
import { OpenAPIV3 } from 'openapi-types';

let openApiData: OpenAPIV3.Document | undefined;

const getData = (): OpenAPIV3.Document => {
  if (!openApiData) {
    const file = fs.readFileSync(path.join(__dirname, '../main.json'), 'utf-8');
    openApiData = JSON.parse(file);
    return openApiData!;
  }
  return openApiData!;
};

export type IModel = {
  schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
  name: string;
};

export const getSchemas = () => {
  const data = getData();
  if (!data.components?.schemas) {
    return [];
  }
  return Object.keys(data.components.schemas).map((schemaKey) => {
    return {
      name: schemaKey,
      schema: data.components!.schemas![schemaKey],
    };
  });
};

const operators = [
  'get',
  'put',
  'post',
  'delete',
  'patch',
  'head',
  'options',
  'trace',
] as const;

export const getPaths = () => {
  const data = getData();
  const paths = Object.entries(data.paths).flatMap(([route, pathInfo]) =>
    parsePathInfo(pathInfo!).map((info) => ({
      route,
      pathInfo: info,
    }))
  );
  return paths;
};

function parsePathInfo(
  pathInfo: OpenAPIV3.PathItemObject
): (OpenAPIV3.OperationObject & { method: typeof operators[number] })[] {
  const params = pathInfo.parameters ?? [];
  return operators
    .filter((op) => pathInfo[op])
    .map((op) => ({
      ...pathInfo[op]!,
      parameters: [...(pathInfo[op]?.parameters ?? []), ...params],
      method: op,
    }));
}
