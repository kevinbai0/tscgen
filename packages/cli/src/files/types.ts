export interface IDir<T extends Record<string, unknown> = {}> {
  type: 'dir';
  path: string;
  filename: string;
  files: IDirItem<T>[];
}

export interface IFile<T extends Record<string, unknown> = {}> {
  type: 'file';
  path: string;
  filename: string;
  data: T;
}

export type IDirItem<T extends Record<string, unknown> = {}> =
  | IDir<T>
  | IFile<T>;

export type ProjectConfig = {
  outDir: string;
  projectDir: string;
};
