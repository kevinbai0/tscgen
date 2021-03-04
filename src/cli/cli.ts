import fs, { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { ProjectConfig } from '../project/config';
import { OutputModule } from '../project/getReference';
import { createFormatter } from '../generators/core/format';
import { combine } from '../generators/core/util';
import { InputData } from '../project/getReference';
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

  await apply(project, async (file) => {
    if (file.filename.split('.').slice(-2).join('.') === 'out.ts') {
      return {
        out: await writeGroup(path.join(file.path, file.filename), {
          projectDir,
          outDir,
        }),
      };
    }
    return {};
  });
}

async function writeFile(
  data: InputData,
  filePath: string,
  fileData: string,
  context: {
    outDir: string;
    projectDir: string;
  }
) {
  const newRoute = Object.keys(data.params ?? {}).reduce(
    (acc, param) => acc.replace(`[${param}]`, data.params![param]),
    filePath
  );
  const outPath = path.join(
    context.outDir,
    path.relative(context.projectDir, newRoute.replace('.out.ts', '.ts'))
  );

  const pathDir = outPath.split('/').slice(0, -1).join('/');
  if (!(await exists(pathDir))) {
    await fs.promises.mkdir(pathDir, {
      recursive: true,
    });
  }
  await fs.promises.writeFile(outPath, fileData);
}

async function writeGroup(
  filePath: string,
  context: {
    projectDir: string;
    outDir: string;
  }
) {
  const res: OutputModule = await import(filePath);

  if (res.getInputs && res.getMappedExports) {
    const inputs = await res.getInputs();

    await Promise.all(
      inputs.map(async (inputData) => {
        const fileData = await format(
          combine(...(await res.getMappedExports!(inputData.data)))
        );
        await writeFile(inputData, filePath, fileData, context);
      })
    );

    return true;
  }
  if (res.getStaticExports) {
    const fileData = await format(combine(...(await res.getStaticExports())));
    await writeFile(
      { params: {}, data: undefined },
      filePath,
      fileData,
      context
    );
  }
  return false;
}

async function exists(dir: string) {
  try {
    await fs.promises.stat(dir);
    return true;
  } catch (err) {
    return false;
  }
}

export {};