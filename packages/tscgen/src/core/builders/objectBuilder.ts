import { objectValue } from '../../javascript/definitions';
import { IJsBodyValue, IJsObjectValue, IJsValue } from '../../javascript/types';
import { writeJsObject } from '../../javascript/write';
import { IType } from '../../typescript/types';
import { writeType } from '../../typescript/write';
import { IEntityBuilder } from './entityBuilder';

export interface IVarObjectBuilder extends IEntityBuilder<'object', string> {
  type: 'object';
  addBody(body: IJsBodyValue): IVarObjectBuilder;
  addTypeDef(typeDefinition: IType): IVarObjectBuilder;
  setLevel(level: 'const' | 'let' | 'var'): IVarObjectBuilder;
  markExport(): IVarObjectBuilder;
}

const deepMerge = <T extends IJsValue>(body: T, body2: T): T => {
  if (
    (body as IJsObjectValue).type === 'object' &&
    (body2 as IJsObjectValue).type === 'object'
  ) {
    return {
      type: 'object',
      value: {
        ...(body as IJsObjectValue).value,
        ...Object.entries((body2 as IJsObjectValue).value).reduce(
          (acc, [key, value]) => {
            if (((body as IJsObjectValue).value as IJsBodyValue)[key]) {
              return {
                ...acc,
                [key]: deepMerge(
                  ((body as IJsObjectValue).value as IJsBodyValue)[key],
                  value
                ),
              };
            }
            return {
              ...acc,
              [key]: value,
            };
          },
          {}
        ),
      },
    } as T;
  }
  if (Array.isArray(body) && Array.isArray(body2)) {
    return [...(body as IJsValue[]), ...(body2 as IJsValue[])] as T;
  }

  return body2;
};

export const varObjectBuilder = (
  name: string,
  defaultValue: {
    body: IJsBodyValue;
    decorate: 'const' | 'let' | 'var';
    export: boolean;
    type?: IType;
  } = {
    body: {},
    decorate: 'const',
    export: false,
  }
): IVarObjectBuilder => {
  function build() {
    const typeStr = defaultValue.type
      ? `: ${writeType(defaultValue.type)}`
      : '';

    return `${defaultValue.export ? 'export ' : ''}${
      defaultValue.decorate
    } ${name}${typeStr} = ${writeJsObject({
      type: 'object',
      value: defaultValue.body,
    })}`;
  }
  return {
    varName: name,
    type: 'object',
    addBody: (body) =>
      varObjectBuilder(name, {
        ...defaultValue,
        body: deepMerge<IJsObjectValue>(
          objectValue(defaultValue.body),
          objectValue(body)
        ).value,
      }),
    markExport: () =>
      varObjectBuilder(name, {
        ...defaultValue,
        export: true,
      }),
    setLevel: (level) =>
      varObjectBuilder(name, {
        ...defaultValue,
        decorate: level,
      }),
    addTypeDef: (type) =>
      varObjectBuilder(name, {
        ...defaultValue,
        type,
      }),
    toString() {
      return build();
    },
  };
};
