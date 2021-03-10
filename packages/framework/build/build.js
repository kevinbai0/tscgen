const path = require('path');

require('esbuild').build({
  platform: 'node',
  tsconfig: 'tsconfig.json',
  outfile: 'dist/main/tscgen-framework.js',
  entryPoints: [path.resolve(__dirname, '../src/index.ts')],
  minify: true,
  bundle: true,
  sourcemap: 'external',
  external: ['eslint'],
});
