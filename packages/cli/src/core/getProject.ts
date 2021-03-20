import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { recursiveDir } from '../files/helpers';
import { IDir, ProjectConfig } from '../files/types';

export function getProjectConfig(): ProjectConfig {
  const currentDir = process.cwd();

  const entryDir = path.resolve(currentDir);
  const config = yaml.load(
    fs.readFileSync(path.resolve(currentDir, 'tscgen.yaml'), 'utf-8')
  ) as Partial<ProjectConfig>;

  return {
    outDir: config.outDir ?? './out',
    projectDir: path.resolve(entryDir, config.projectDir ?? 'src'),
  };
}

export async function getProjectDir(config: ProjectConfig): Promise<IDir> {
  return {
    type: 'dir',
    path: config.projectDir,
    filename: config.projectDir.split('/').slice(-1).join('/'),
    files: await recursiveDir(config.projectDir),
  };
}
