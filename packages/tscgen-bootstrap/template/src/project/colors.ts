import * as tscgen from 'tscgen';
import { register } from 'tscgen-framework';
import data from '../data.json';

export default register('Colors').generateExports(() => {
  return {
    exports: {
      Colors: tscgen
        .typeAliasBuilder('Colors')
        .addUnion(...data.data.map((val) => tscgen.stringType(val.color)))
        .markExport(),
    },
  };
});
