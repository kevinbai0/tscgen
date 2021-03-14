#!/usr/bin/env node

require('ts-node').register({
  project: require('path').join(__dirname, 'tsconfig.json'),
  transpileOnly: true,
  "dir": __dirname
});
require('./src/cli')
