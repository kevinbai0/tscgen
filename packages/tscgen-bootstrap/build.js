const path = require('path');

require('esbuild').build({
  platform: 'node',
  bundle: true,
  entryPoints: [path.resolve(__dirname, 'src/cli.ts')],
  outfile: 'dist/index.js',
  banner: '#!/usr/bin/env node',
  external: ['yargs', 'chalk'],
  minify: true,
  sourcemap: 'external',
});
