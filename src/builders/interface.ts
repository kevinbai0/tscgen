import { IBodyType, IGenericOptions, IGenericValue, IType } from '../types';
import { writeBodyType, writeGeneric, writeType } from '../write';
import { IBaseBuilder } from './types';

interface IInterfaceBuilder<
  Name extends string,
  Generics extends Readonly<
    IGenericValue<string, IGenericOptions | undefined>[]
  >,
  Body extends IBodyType,
  Exported extends boolean,
  Extend extends IType | undefined
> extends IBaseBuilder<'interface', Name> {
  type: 'interface';
  addGeneric<
    N extends string,
    Options extends IGenericOptions = {},
    T extends Readonly<IGenericValue<N, Options>> = Readonly<
      IGenericValue<N, Options>
    >
  >(
    name: N,
    options?: Options
  ): IInterfaceBuilder<Name, [...Generics, T], Body, Exported, Extend>;
  addBody<T extends IBodyType>(
    body: T
  ): IInterfaceBuilder<Name, Generics, Combine<Body, T>, Exported, Extend>;
  extends<T extends IType>(
    type: IType
  ): IInterfaceBuilder<Name, Generics, Body, Exported, T>;
  markExport(): IInterfaceBuilder<Name, Generics, Body, true, Extend>;
  body: Body;
  generics: Generics;
}

type Combine<T, K> = {
  [Key in keyof T | keyof K]: Key extends keyof K
    ? K[Key]
    : Key extends keyof T
    ? T[Key]
    : never;
};

export function interfaceBuilder<
  Name extends string,
  Generics extends Readonly<IGenericValue[]> = [],
  Body extends IBodyType = {},
  Exported extends boolean = false,
  Extend extends IType | undefined = undefined
>(
  interfaceName: Name,
  defaultOptions: {
    generics?: Generics;
    extends?: Extend;
    body: Body;
    export: boolean;
  } = {
    body: {} as Body,
    export: false,
  }
): IInterfaceBuilder<Name, Generics, Body, Exported, Extend> {
  function build(): string {
    const extendsStr = defaultOptions.extends
      ? ` extends ${writeType(defaultOptions.extends)}`
      : '';
    return `${
      defaultOptions.export ? 'export ' : ''
    }interface ${interfaceName}${writeGeneric(
      defaultOptions.generics ?? []
    )}${extendsStr} {${writeBodyType(defaultOptions.body)}}`;
  }

  return {
    type: 'interface',
    addGeneric<
      N extends string,
      Options extends IGenericOptions,
      T extends IGenericValue<N, Options>
    >(name: N, options: Options) {
      return interfaceBuilder(interfaceName, {
        ...defaultOptions,
        generics: [
          defaultOptions.generics ?? [],
          { name, options },
        ] as readonly IGenericValue[],
      }) as IInterfaceBuilder<Name, [...Generics, T], Body, Exported, Extend>;
    },
    addBody<T extends IBodyType>(body: T) {
      return interfaceBuilder(interfaceName, {
        ...defaultOptions,
        body: {
          ...defaultOptions.body,
          ...body,
        } as Combine<Body, T>,
      });
    },
    extends<T extends IType>(type: T) {
      return interfaceBuilder(interfaceName, {
        ...defaultOptions,
        extends: type,
      });
    },
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
    get body() {
      return defaultOptions.body;
    },
    get generics() {
      return (defaultOptions.generics ?? []) as Generics;
    },
  };
}
