import { typeDefBuilder } from '../generators/core/builders/typeBuilder';
import {
  createPathExport,
  createStaticExports,
  getReference,
} from '../project/getReference';
import * as tscgen from '../index';

export const getPath = createPathExport(__dirname, 'routes.out.ts');

export const getStaticExports = createStaticExports(async () => {
  const references = await getReference(import('./models/[name].out'), getPath);
  const mappedExports = await references.referenceMappedExports(([val]) => val);

  return [
    ...mappedExports.imports,
    typeDefBuilder('Routes')
      .markExport()
      .addUnion(
        ...mappedExports.exports.map((builder) =>
          tscgen.identifierType(builder)
        )
      ),
  ];
});
