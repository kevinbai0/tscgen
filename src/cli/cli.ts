import fs, { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { ProjectConfig } from '../project/config';
import { createFormatter } from '../utils/format';
import { apply, recursiveDir } from './helpers';
import { IDir } from './types';

const format = createFormatter(path.resolve(__dirname, 'cli.ts'));

main().catch(console.error);
async function main() {
  const projectDir = path.resolve(__dirname, '../example');

  const config: ProjectConfig = (
    await import(path.join(projectDir, 'tscgen.config.ts'))
  ).default;
  const outDir = config.outDir ?? './dist';

  if (!existsSync(outDir)) {
    mkdirSync(outDir);
  }

  const project: IDir = {
    type: 'dir',
    path: projectDir,
    filename: projectDir.split('/').slice(-1).join('/'),
    files: await recursiveDir(projectDir),
  };

  const res = await apply(project, async (file) => {
    if (file.filename.split('.').slice(-2).join('.') === 'out.ts') {
      return {
        out: await writeGroup(
          path.join(file.path, file.filename),
          projectDir,
          outDir
        ),
      };
    }
    return {};
  });
}

async function writeGroup(
  filePath: string,
  projectDir: string,
  outDir: string
) {
  // extract out file

  // assume file exists
  const res = await import(filePath);
  const inputs = await res.inputs;

  const newData = await Promise.all(
    inputs.map(async (val: any) => ({
      params: val.params,
      out: await format(res.tscgen(val.data).toString()),
    }))
  );

  await Promise.all(
    newData.map(async (data: any) => {
      const newRoute = Object.keys(data.params ?? {}).reduce(
        (acc, param) => acc.replace(`[${param}]`, data.params![param]),
        filePath
      );
      const outPath = path.join(
        outDir,
        path.relative(projectDir, newRoute.replace('.out.ts', '.ts'))
      );

      const pathDir = outPath.split('/').slice(0, -1).join('/');
      if (!(await exists(pathDir))) {
        await fs.promises.mkdir(pathDir, {
          recursive: true,
        });
      }
      await fs.promises.writeFile(outPath, data.out);
    })
  );
  return true;
}

async function exists(dir: string) {
  try {
    await fs.promises.stat(dir);
    return true;
  } catch (err) {
    return false;
  }
}
