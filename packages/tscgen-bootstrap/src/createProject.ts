import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { dirExists, mkdirp } from './fsHelpers';
import { apply, recursiveDir } from './helpers';
import { IDir } from './types';

export interface ICreateProjectOptions {
  projectName: string;
}

export const createProject = async (
  options: ICreateProjectOptions
): Promise<void> => {
  if (
    fs.existsSync(options.projectName) &&
    fs.statSync(options.projectName).isDirectory
  ) {
    console.log(
      chalk.red(
        `A folder with the name ${chalk.cyan(
          options.projectName
        )} already exists`
      )
    );
    process.exit(1);
  }

  console.log(
    chalk.green(`Creating project ${chalk.cyan(`"${options.projectName}"`)}`)
  );

  const templateDir = path.resolve(__dirname, '../template');
  const outDir = path.resolve(options.projectName);
  fs.mkdirSync(outDir);

  const dir: IDir = {
    path: templateDir,
    filename: '',
    type: 'dir',
    files: await recursiveDir(templateDir),
  };

  await apply(dir, async (file) => {
    const relativeDir = path.join(
      outDir,
      path.relative(templateDir, file.path)
    );

    const outFile = path.join(relativeDir, file.filename);

    if (!dirExists(relativeDir)) {
      mkdirp(relativeDir);
    }

    const fileData = await fs.promises.readFile(
      path.join(file.path, file.filename),
      'utf-8'
    );

    await fs.promises.writeFile(
      outFile,
      fileData.replace(/\{\{projectName\}\}/g, options.projectName)
    );

    return {};
  });

  console.log(chalk.green(`Installing dependencies`));

  const installCmd = spawn(`npm`, ['i', '--prefix', outDir]);
  installCmd.stdout.on('data', (data) => {
    console.log(data.toString());
  });
  installCmd.stderr.on('data', (data) => {
    console.log(chalk.red(data.toString()));
  });
  installCmd.on('close', () => {
    console.log(chalk.green('Finished'));
  });
};
