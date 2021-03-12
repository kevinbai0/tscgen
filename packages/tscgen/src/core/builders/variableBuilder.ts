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
  markExport(): IVariableBuilder;
}

export const variableBuilder = (
  name: string,
  defaultValue: {
    body?: IJsValue;
    decorate: 'const' | 'let' | 'var';
    export: boolean;
    type?: IType;
  } = {
    decorate: 'const',
    export: false,
  }
): IVariableBuilder => {
  function build() {
    const typeStr = defaultValue.type
      ? `: ${writeType(defaultValue.type)}`
      : '';

    return `${defaultValue.export ? 'export ' : ''}${
      defaultValue.decorate
    } ${name}${typeStr} = ${writeJsValue(
      defaultValue.body ?? undefinedValue()
    )}`;
  }
  return {
    varName: name,
    type: 'variable',
    setAssignment: (body) =>
      variableBuilder(name, {
        ...defaultValue,
        body,
      }),
    markExport: () =>
      variableBuilder(name, {
        ...defaultValue,
        export: true,
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
