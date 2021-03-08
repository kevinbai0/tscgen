import { writeBodyType, writeGeneric, writeType } from '../../typescript/write';
import {
  IBodyType,
  IGenericOptions,
  IGenericValue,
  IIdentifierType,
} from '../../typescript/types';
import { identifierType } from '../../typescript/definitions';
import { IEntityBuilder } from './entityBuilder';

export type IGenericInterfaceBuilder = IInterfaceBuilder<
  string,
  ReadonlyArray<IGenericValue<string, IGenericOptions | undefined>>,
  IBodyType,
  boolean,
  IIdentifierType<IEntityBuilder<'interface', string>> | undefined
>;
export interface IInterfaceBuilder<
  Name extends string,
  Generics extends Readonly<
    IGenericValue<string, IGenericOptions | undefined>[]
  >,
  Body extends IBodyType,
  Exported extends boolean,
  Extend extends
    | IIdentifierType<IEntityBuilder<'interface', string>>
    | undefined
> extends IEntityBuilder<'interface', Name> {
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
  extends<T extends IEntityBuilder<'interface', string>>(
    type: T
  ): IInterfaceBuilder<Name, Generics, Body, Exported, IIdentifierType<T>>;
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
  Extend extends
    | IIdentifierType<IEntityBuilder<'interface', string>>
    | undefined = undefined,
  Key extends string = string
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
          ...(defaultOptions.generics ?? []),
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
    extends<T extends IEntityBuilder<'interface', string>>(type: T) {
      return interfaceBuilder(interfaceName, {
        ...defaultOptions,
        extends: identifierType(type) as IIdentifierType<T>,
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