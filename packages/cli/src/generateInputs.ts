import fs from 'fs';
import path from 'path';
import { OutputModule } from 'tscgen-framework';
import ts, { SyntaxKind, TypeFlags } from 'typescript';
import { getProjectConfig, getProjectDir } from './core/getProject';
import { apply, extractFiles } from './files/helpers';
import { IFile } from './files/types';

export async function generateInputs() {
  const config = getProjectConfig();

  const project = await getProjectDir(config);

  const allNames: string[] = [];
  await apply(project, async (file) => {
    if (file.filename.endsWith('.ts')) {
      allNames.push(path.join(file.path, file.filename));
    }
    return {};
  });

  const readonlyNames: ReadonlyArray<string> = [...allNames];
  const options = fs.readFileSync(
    path.resolve(process.cwd(), 'tsconfig.json'),
    'utf-8'
  );

  const program = ts.createProgram(readonlyNames, JSON.parse(options));
  const typeChecker = program.getTypeChecker();

  const sources = await apply(project, getMappedExportFiles(program));
  await extractFiles(sources, ['src/project/routes'], async (file) => {
    if (!file.data.source) {
      return file.data;
    }
    const source = file.data.source;
    source.forEachChild((node) => {
      if (ts.isExportAssignment(node)) {
        console.log(SyntaxKind[node.expression.kind]);
        if (ts.isCallExpression(node.expression)) {
          const type = typeChecker.typeToString(
            typeChecker.getTypeAtLocation(node.expression.expression.expression)
          );
          console.log(type);
        }
      }
    });
    return {};
  });
}

type WithSourceData = {
  source?: ts.SourceFile;
};

function getMappedExportFiles(program: ts.Program) {
  return async <T extends IFile>(file: T): Promise<WithSourceData> => {
    if (
      !file.filename.endsWith('.ts') ||
      file.filename.endsWith('.static.ts')
    ) {
      return file.data;
    }
    const filePath = path.join(file.path, file.filename);
    const res: OutputModule = await import(filePath);

    const defaultExport = await res.default;
    if (!defaultExport.inputs) {
      return file.data;
    }

    const source = program.getSourceFile(filePath);

    return {
      ...file.data,
      source,
    };
  };
}
