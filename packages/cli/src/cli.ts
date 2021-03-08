import fs, { existsSync, mkdirSync } from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { combine } from 'tscgen';
import { createContext, InputData, OutputModule } from 'tscgen-framework';
import { apply, recursiveDir } from './helpers';
import { IDir, ProjectConfig } from './types';

const hiddenExtensions = new Set(['config', 'helper']);

const currentDir = process.cwd();

main().catch(console.error);
async function main() {
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

  await apply(project, async (file) => {
    const fileComponents = file.filename.split('.');
    const isTypescript = fileComponents.slice(-1)[0] === 'ts';
    const isConfigFile =
      fileComponents.length > 2 &&
      hiddenExtensions.has(fileComponents.slice(-2, -1)[0]);

    if (isTypescript && !isConfigFile) {
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
    path.relative(context.projectDir, newRoute)
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
    const ctx = (
      await createContext(res.getInputs!, res.getMappedExports!, res.getPath!)
    ).map(async ({ imports, exports, inputData }) => {
      const output = combine(
        ...(imports ?? []),
        ...exports.order.map((key) => exports.values[key])
      );
      await writeFile(inputData, filePath, output, context);
    });

    await Promise.all(ctx);

    return true;
  }
  if (res.getStaticExports) {
    const outputData = await res.getStaticExports();
    const output = combine(
      ...(outputData.imports ?? []),
      ...outputData.exports.order.map((key) => outputData.exports.values[key])
    );

    await writeFile({ params: {}, data: undefined }, filePath, output, context);
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
