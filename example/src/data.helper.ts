import fs from 'fs';
import path from 'path';
import { OpenAPIV3 } from 'openapi-types';

let openApiData: OpenAPIV3.Document | undefined;

const getData = (): OpenAPIV3.Document => {
  if (!openApiData) {
    const file = fs.readFileSync(path.join(__dirname, 'main.json'), 'utf-8');
    openApiData = JSON.parse(file);
    return openApiData!;
  }
  return openApiData!;
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
