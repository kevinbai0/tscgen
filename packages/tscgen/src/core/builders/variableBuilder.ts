import { undefinedValue } from '../../javascript/definitions';
import { IJsValue } from '../../javascript/types';
import { writeJsValue } from '../../javascript/write';
import { IType } from '../../typescript/types';
import { writeType } from '../../typescript/write';
import { IEntityBuilder } from './entityBuilder';

export interface IVariableBuilder extends IEntityBuilder<'variable', string> {
  type: 'variable';
  setAssignment(body: IJsValue): IVariableBuilder;
  addTypeAlias(typeDefinition: IType): IVariableBuilder;
  setLevel(level: 'const' | 'let' | 'var'): IVariableBuilder;
  markExport(defaultExport?: boolean): IVariableBuilder;
}

export const variableBuilder = (
  name: string,
  defaultValue: {
    body?: IJsValue;
    decorate: 'const' | 'let' | 'var';
    export: boolean;
    type?: IType;
    defaultExport: boolean;
  } = {
    decorate: 'const',
    export: false,
    defaultExport: false,
  }
): IVariableBuilder => {
  function build() {
    const typeStr = defaultValue.type
      ? `: ${writeType(defaultValue.type)}`
      : '';

    const valueStr = `${writeJsValue(defaultValue.body ?? undefinedValue())}`;

    if (defaultValue.export && defaultValue.defaultExport) {
      return `export default ${valueStr}`;
    }

    return `${defaultValue.export ? 'export ' : ''}${
      defaultValue.decorate
    } ${name}${typeStr} = ${valueStr}`;
  }
  return {
    varName: name,
    type: 'variable',
    setAssignment: (body) =>
      variableBuilder(name, {
        ...defaultValue,
        body,
      }),
    markExport: (defaultExport = false) =>
      variableBuilder(name, {
        ...defaultValue,
        export: true,
        defaultExport,
      }),
    setLevel: (level) =>
      variableBuilder(name, {
        ...defaultValue,
        decorate: level,
      }),
    addTypeAlias: (type) =>
      variableBuilder(name, {
        ...defaultValue,
        type,
      }),
    toString() {
      return build();
    },
    as() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return this as any;
    },
  };
};
