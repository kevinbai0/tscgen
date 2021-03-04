import path from 'path';
import * as tscgen from '../index';

const config: tscgen.ProjectConfig = {
  outDir: path.resolve(__dirname, '../..', './dist'),
};

export default config;
