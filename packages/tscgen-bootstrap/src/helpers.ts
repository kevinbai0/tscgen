import fs from 'fs';
import path from 'path';
import { IDir, IDirItem, IFile } from './types';

export async function extractFiles<K extends Record<string, unknown>, T>(
  dir: IDir<K>,
  paths: string[],
  extractFn: (file: IFile<K>) => T,
  basePath?: string
): Promise<T[]> {
  function matchesPath(p: string): boolean {
    const match = paths.find((path) => path.includes(p) || p.includes(path));
    return !!match;
  }
  const base = basePath ?? dir.path;

  const relPath = path.relative(base, dir.path);
  if (!matchesPath(relPath)) {
    return Promise.resolve([]);
  }

  const then = await Promise.all(
    dir.files.map((file) => {
      if (file.type === 'dir') {
        return extractFiles(file, paths, extractFn, base);
      }
      if (matchesPath(path.join(file.path, file.filename))) {
        return Promise.resolve([extractFn(file)]);
      }
      return Promise.resolve([]);
    })
  );
  return then.flat();
}

export async function apply<
  K extends Record<string, unknown>,
  T extends Record<string, unknown>
>(dir: IDir<K>, applyFn: (file: IFile<K>) => Promise<T>): Promise<IDir<T>> {
  const newFiles = await Promise.all(
    dir.files.map<Promise<IDirItem<T>>>(async (file) => {
      if (file.type === 'dir') {
        return apply(file, applyFn);
      }
      return {
        ...file,
        data: await applyFn(file),
      };
    })
  );
  return {
    ...dir,
    files: newFiles,
  };
}

export async function recursiveDir(dir: string): Promise<IDirItem[]> {
  const files = await fs.promises.readdir(dir);

  const resolved = files.map(async (file) => {
    const stat = await fs.promises.stat(path.resolve(dir, file));
    if (stat.isDirectory()) {
      return {
        type: 'dir',
        filename: file,
        path: dir,
        files: [],
      } as const;
    }
    return {
      type: 'file',
      path: dir,
      filename: file,
      data: {},
    } as const;
  });

  const fileData = await Promise.all(resolved);

  return Promise.all(
    fileData.map(async (data) => {
      if (data.type === 'file') {
        return data;
      }
      return {
        ...data,
        files: await recursiveDir(path.resolve(dir, data.filename)),
      };
    })
  );
}

export const withApplyFn = <K extends Record<string, unknown>>(
  applyFn: (file: IFile) => Promise<K>
): ((file: IFile) => Promise<K>) => {
  return applyFn;
};
