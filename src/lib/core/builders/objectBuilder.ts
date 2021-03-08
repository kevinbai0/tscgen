import { objectValue } from '../../javascript/definitions';
import { IJsBodyValue, IJsObjectValue, IJsValue } from '../../javascript/types';
import { writeJsObject } from '../../javascript/write';
import { IType } from '../../typescript/types';
import { writeType } from '../../typescript/write';
import { IEntityBuilder } from './entityBuilder';

interface IVarObjectBuilder<Key extends string>
  extends IEntityBuilder<'object', string, Key> {
  type: 'object';
  addBody(body: IJsBodyValue): IVarObjectBuilder<Key>;
  addTypeDef(typeDefinition: IType): IVarObjectBuilder<Key>;
  setLevel(level: 'const' | 'let' | 'var'): IVarObjectBuilder<Key>;
  markExport(): IVarObjectBuilder<Key>;
  setKey<NewKey extends string>(key: NewKey): IVarObjectBuilder<NewKey>;
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

export const varObjectBuilder = <Key extends string>(
  name: string,
  defaultValue: {
    body: IJsBodyValue;
    decorate: 'const' | 'let' | 'var';
    export: boolean;
    type?: IType;
    key?: Key;
  } = {
    body: {},
    decorate: 'const',
    export: false,
  }
): IVarObjectBuilder<Key> => {
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
    get key() {
      return defaultValue.key;
    },
    setKey<NewKey extends string>(key: NewKey) {
      return varObjectBuilder(name, {
        ...defaultValue,
        key,
      });
    },
  };
};
