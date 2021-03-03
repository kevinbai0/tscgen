import { IBodyType, IGenericValue, IType } from '../types';
import { writeBodyType, writeGeneric, writeType } from '../write';
import { IBaseBuilder } from './types';

interface IInterfaceBuilder extends IBaseBuilder {
  type: 'interface';
  addGenerics: (...generics: IGenericValue[]) => IInterfaceBuilder;
  addBody(body: IBodyType): IInterfaceBuilder;
  extends(type: IType): IInterfaceBuilder;
  markExport(): IInterfaceBuilder;
}

export function interfaceBuilder(
  interfaceName: string,
  defaultOptions: {
    generics: Array<IGenericValue>;
    extends?: IType;
    body: IBodyType;
    export: boolean;
  } = {
    generics: [],
    body: {},
    export: false,
  }
): IInterfaceBuilder {
  function build(): string {
    const extendsStr = defaultOptions.extends
      ? ` extends ${writeType(defaultOptions.extends)}`
      : '';
    return `${
      defaultOptions.export ? 'export ' : ''
    }interface ${interfaceName}${writeGeneric(
      defaultOptions.generics
    )}${extendsStr} {${writeBodyType(defaultOptions.body)}}`;
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
    extends: (type) =>
      interfaceBuilder(interfaceName, {
        ...defaultOptions,
        extends: type,
      }),
    toString() {
      return build();
    },
    get varName() {
      return interfaceName;
    },
    markExport: () =>
      interfaceBuilder(interfaceName, {
        ...defaultOptions,
        export: true,
      }),
  };
}
