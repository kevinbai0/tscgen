import { existsSync, mkdirSync } from 'fs';
import { Command } from 'commander';

import { getProjectConfig, getProjectDir } from './core/getProject';
import { generateInputs } from './generateInputs';
import { transpileFolder } from './transpileFolder';

const program = new Command();

program.action(transpile).command('generate').action(generateInputs).parse();

async function transpile() {
  const config = getProjectConfig();
  if (!existsSync(config.outDir)) {
    mkdirSync(config.outDir);
  }
  const project = await getProjectDir(config);
  await transpileFolder(project, config);
}
