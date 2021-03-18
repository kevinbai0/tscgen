import fs, { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { Command } from 'commander';
import yaml from 'js-yaml';

import { recursiveDir } from './files/helpers';
import { IDir, ProjectConfig } from './files/types';
import { transpileFolder } from './transpileFolder';

const currentDir = process.cwd();

const program = new Command();

program.action(transpile).parse();

async function transpile() {
  const entryDir = path.resolve(currentDir);
  const config = yaml.load(
    fs.readFileSync(path.resolve(currentDir, 'tscgen.yaml'), 'utf-8')
  ) as ProjectConfig;
  const outDir = config.outDir ?? './out';
  const projectDir = path.resolve(entryDir, config.projectDir ?? 'src');

  if (!existsSync(outDir)) {
    mkdirSync(outDir);
  }

  const project: IDir = {
    type: 'dir',
    path: projectDir,
    filename: projectDir.split('/').slice(-1).join('/'),
    files: await recursiveDir(projectDir),
  };

  await transpileFolder(project, {
    outDir,
    projectDir,
  });
}
