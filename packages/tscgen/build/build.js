const path = require('path');

require('esbuild').build({
  platform: 'node',
  bundle: true,
  tsconfig: path.resolve(__dirname, './tsconfig.build.json'),
  entryPoints: [path.resolve(__dirname, '../src/index.ts')],
  outfile: 'dist/main/tscgen.js',
  external: ['eslint'],
  minify: true,
  sourcemap: 'external',
});
