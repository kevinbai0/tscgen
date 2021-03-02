import { IBodyType, IGenericValue } from '../types';
import { writeBodyType, writeGeneric } from '../write';
import { IBaseBuilder } from './types';

interface IInterfaceBuilder extends IBaseBuilder {
  type: 'interface';
  addGenerics: (...generics: IGenericValue[]) => IInterfaceBuilder;
  addBody(body: IBodyType): IInterfaceBuilder;
}

export function interfaceBuilder(
  interfaceName: string,
  defaultOptions: {
    generics: Array<IGenericValue>;
    body: IBodyType;
  } = {
    generics: [],
    body: {},
  }
): IInterfaceBuilder {
  function build(): string {
    return `interface ${interfaceName}${writeGeneric(
      defaultOptions.generics
    )} {${writeBodyType(defaultOptions.body)}}`;
  }

  return {
    type: 'interface',
    addGenerics: (...generics: Array<IGenericValue>) =>
      interfaceBuilder(interfaceName, {
        ...defaultOptions,
        generics: [...defaultOptions.generics, ...generics],
      }),
    addBody(body: IBodyType) {
      return interfaceBuilder(interfaceName, {
        ...defaultOptions,
        body: {
          ...defaultOptions.body,
          ...body,
        },
      });
    },
    toString() {
      return build();
    },
    get varName() {
      return interfaceName;
    },
  };
}
