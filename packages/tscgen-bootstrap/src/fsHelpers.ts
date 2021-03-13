import fs from 'fs';

export const dirExists = (dir: string): boolean => {
  try {
    const stat = fs.statSync(dir);
    return stat.isDirectory();
  } catch (err) {
    return false;
  }
};

export const mkdirp = (dir: string): void => {
  const folders = dir.split('/');
  if (!dirExists(dir)) {
    mkdirp(folders.slice(0, -1).join('/'));
    fs.mkdirSync(dir);
    return;
  } else {
    return;
  }
};
