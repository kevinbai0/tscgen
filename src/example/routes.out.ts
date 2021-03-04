import { typeDefBuilder } from '../generators/core/builders/typeBuilder';
import {
  createPathExport,
  createStaticExports,
  getReference,
} from '../project/getReference';
import * as tscgen from '../index';

export const getStaticExports = createStaticExports(async () => {
  const references = await getReference(import('./models/[name].out'));
  const mappedExports = await references.referenceMappedExports();

  return [
    typeDefBuilder('Routes')
      .markExport()
      .addUnion(
        ...mappedExports.map(([builder]) => tscgen.identifierType(builder))
      ),
  ];
});

export const getPath = createPathExport(__dirname, 'routes.out.ts');
