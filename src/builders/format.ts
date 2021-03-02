import { randomBytes } from 'crypto';
import path from 'path';
import fs from 'fs';
import eslint from 'eslint';

const linter: eslint.ESLint = new eslint.ESLint({
  useEslintrc: true,
  fix: true,
});

const dir: string = path.join(__dirname, 'tmp');

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

export const format = async (text: string): Promise<string> => {
  const randomFile = `${randomBytes(8).toString('hex')}.ts`;
  const filePath = path.join(dir, randomFile);
  await fs.promises.writeFile(filePath, text);
  const res = await linter.lintText(text, {
    filePath,
    warnIgnored: false,
  });

  if (res[0].errorCount || !res[0].output) {
    console.log('messages: ', res[0].messages);
    console.log('source: ', res[0].source);
    throw new Error('lint error');
  }
  await fs.promises.rm(dir, {
    recursive: true,
  });
  return res[0].output!;
};
