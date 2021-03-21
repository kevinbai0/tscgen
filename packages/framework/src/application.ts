import fs from 'fs';
import path from 'path';
import { combine } from 'tscgen';
import { Application, InputData, RegisteredModule } from './types';

type WithPromise<T> = {
  [key in keyof T]: Promise<T[key]>;
};

export function registerAll<T extends ReadonlyArray<RegisteredModule>>(
  ...modules: WithPromise<T>
): {
  setInputs: (values: Application<T>['data']) => Promise<Application<T>>;
} {
  return {
    setInputs: async (data) => {
      return {
        modules: ((await Promise.all(modules)) as unknown) as T,
        data,
      };
    },
  };
}

export async function writeApplication(
  app: Application<ReadonlyArray<RegisteredModule>>
) {
  const getOutDir = (dir: string) => path.join('out', dir);

  const res = app.modules.map(async (module) => {
    if (module.isStatic) {
      const source = fs.readFileSync(module.source!, 'utf-8');

      await createPathForFile(getOutDir(module.pathData.path));

      return fs.writeFileSync(getOutDir(module.pathData.path), source);
    }
    const data = app.data as Record<string, InputData[]>;

    const pathData = data[module.pathData.path] ?? [];
    const res = await module.getData(pathData, app);

    res.forEach(async (val) => {
      const newFilePath = getOutDir(
        module.pathData.paramList.reduce(
          (acc, param) => acc.replace(`[${param}]`, val.data.params[param]),
          module.pathData.path as string
        )
      );

      await createPathForFile(newFilePath);

      fs.writeFileSync(
        newFilePath,
        combine(...[...(val.imports ?? []), ...Object.values(val.exports)])
      );
    });
  });

  await Promise.all(res);
}

async function createPathForFile(filePath: string) {
  const pathDir = filePath.endsWith(`.ts`)
    ? filePath.split('/').slice(0, -1).join('/')
    : filePath;

  if (!(await exists(pathDir))) {
    await fs.promises.mkdir(pathDir, {
      recursive: true,
    });
  }
}

async function exists(dir: string) {
  try {
    await fs.promises.stat(dir);
    return true;
  } catch (err) {
    return false;
  }
}
