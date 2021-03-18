import fs from 'fs';
import path from 'path';
import { combine } from 'tscgen';
import {
  createContext,
  GetInputs,
  InputData,
  OutputModule,
  OutputType,
} from 'tscgen-framework';
import { apply } from './files/helpers';
import { IDir } from './files/types';

export interface IProjectContext {
  outDir: string;
  projectDir: string;
}

export async function transpileFolder(project: IDir, context: IProjectContext) {
  await apply(project, async (file) => {
    const fileComponents = file.filename.split('.');
    const isTypescript = fileComponents.slice(-1)[0] === 'ts';

    if (file.filename.endsWith('.static.ts') || !isTypescript) {
      const fileData = await fs.promises.readFile(
        path.join(file.path, file.filename),
        'utf-8'
      );

      await writeFile(
        {
          data: undefined,
          params: {},
        },
        `${path.join(file.path, file.filename.replace('.static', ''))}`,
        fileData,
        context
      );
      return {};
    }

    if (isTypescript) {
      return {
        out: await writeGroup(path.join(file.path, file.filename), context),
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

  const defaultExport = await res.default;

  if (res.getPath && defaultExport.inputs) {
    const data = defaultExport as OutputType<ReadonlyArray<string>, GetInputs>;
    const ctx = (
      await createContext(data.inputs!, data.getExports!, res.getPath, {})
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

  const data = defaultExport as OutputType<ReadonlyArray<string>, undefined>;
  const outputData = await data.getExports();
  const output = combine(
    ...(outputData.imports ?? []),
    ...data.routes.map((key) => outputData.exports[key])
  );

  await writeFile({ params: {}, data: undefined }, filePath, output, context);
}

async function exists(dir: string) {
  try {
    await fs.promises.stat(dir);
    return true;
  } catch (err) {
    return false;
  }
}
