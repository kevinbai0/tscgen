import path from 'path';

export const getFilename = (
  toFile: string,
  caller: string,
  params: Record<string, string>
) => {
  const callerComponents = caller.split('/');
  const referenceComponents = toFile.split('/');
  const relativePath = path.relative(
    callerComponents.slice(0, -1).join('/'),
    referenceComponents.slice(0, -1).join('/')
  );
  const dir = relativePath.startsWith('..')
    ? `${relativePath.length ? `${relativePath}/` : ''}`
    : `./${relativePath.length ? `${relativePath}/` : ''}`;

  const outFile = Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`[${key}]`, value),
    referenceComponents.slice(-1)[0].split('.').slice(0, -1).join('.')
  );

  return `${dir}${outFile}`;
};
