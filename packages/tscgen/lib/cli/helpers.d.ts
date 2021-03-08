import { IDir, IDirItem, IFile } from './types';
export declare function extractFiles<K extends Record<string, unknown>, T>(dir: IDir<K>, paths: string[], extractFn: (file: IFile<K>) => T, basePath?: string): Promise<T[]>;
export declare function apply<K extends Record<string, unknown>, T extends Record<string, unknown>>(dir: IDir<K>, applyFn: (file: IFile<K>) => Promise<T>): Promise<IDir<T>>;
export declare function recursiveDir(dir: string): Promise<IDirItem[]>;
export declare const withApplyFn: <K extends Record<string, unknown>>(applyFn: (file: IFile) => Promise<K>) => (file: IFile) => Promise<K>;
