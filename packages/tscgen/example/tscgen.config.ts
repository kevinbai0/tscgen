import path from 'path';
import * as tscgen from '../src/framework';

const config: tscgen.ProjectConfig = {
  outDir: path.resolve(__dirname, './dist'),
  projectDir: path.resolve(__dirname, './src'),
};

export default config;
