import path from 'path';
import eslint from 'eslint';

/**
 *
 * @param pathToFile - any typescript file in project
 * @returns
 * @internal
 */
export const createFormatter = (pathToFile: string) => {
  const linter: eslint.ESLint = new eslint.ESLint({
    useEslintrc: true,
    fix: true,
    overrideConfig: {
      rules: {
        'import/no-unresolved': 0,
      },
    },
  });

  return async (text: string): Promise<string> => {
    const res = await linter.lintText(text, {
      filePath: path.resolve(pathToFile),
    });
    if (!res.length || res[0].errorCount || !res[0].output) {
      const formatter = await linter.loadFormatter();
      throw new Error(formatter.format(res));
    }

    return res[0].output!;
  };
};

/**
 * @internal
 */
export type Formatter = ReturnType<typeof createFormatter>;
