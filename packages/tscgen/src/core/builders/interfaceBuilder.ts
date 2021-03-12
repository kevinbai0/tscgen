import { identifierType } from '../../typescript/definitions';
import {
  IBodyType,
  IGenericOptions,
  IGenericValue,
  IIdentifierType,
} from '../../typescript/types';
import { writeBodyType, writeGeneric, writeType } from '../../typescript/write';
import { IEntityBuilder } from './entityBuilder';

export type IGenericInterfaceBuilder = IInterfaceBuilder<
  string,
  ReadonlyArray<IGenericValue<string, IGenericOptions | undefined>>,
  IBodyType,
  boolean,
  IIdentifierType<IEntityBuilder<'interface', string>> | undefined
>;

/**
 * Represents an interface
 * @public
 */
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

  /**
   * Adds a body to the interface - if multiple bodies are passed in, it merges the bodies together (but not an intersection type)
   * @param body - The body to pass in of type IBodyType
   * @returns A new interface builder with the specified body added
   */
  addBody<T extends IBodyType>(
    body: T
  ): IInterfaceBuilder<Name, Generics, Combine<Body, T>, Exported, Extend>;

  /**
   * Make the interface extend another identifier - must be another Entity that it extends
   * @param body - The body to pass in
   * @returns A new interface builder with the new extends parameter
   */
  extends<T extends IEntityBuilder<'interface', string>>(
    type: T
  ): IInterfaceBuilder<Name, Generics, Body, Exported, IIdentifierType<T>>;

  /**
   * Make the interface exportable
   * @returns A new interface builder that will be exported
   */
  markExport(
    defaultExport?: boolean
  ): IInterfaceBuilder<Name, Generics, Body, true, Extend>;
  body: Body;
  generics: Generics;
}

/**
 * Combine 2 Record types into one
 */
export type Combine<T, K> = {
  [Key in keyof T | keyof K]: Key extends keyof K
    ? K[Key]
    : Key extends keyof T
    ? T[Key]
    : never;
};

/**
 * Build a Typescript `interface`
 * @param interfaceName - The name of the interface
 * @returns
 * @public
 */
export function interfaceBuilder<
  Name extends string,
  Generics extends Readonly<IGenericValue[]> = [],
  Body extends IBodyType = {},
  Exported extends boolean = false,
  Extend extends
    | IIdentifierType<IEntityBuilder<'interface', string>>
    | undefined = undefined
>(
  interfaceName: Name,
  defaultOptions: {
    generics?: Generics;
    extends?: Extend;
    body: Body;
    export: boolean;
    defaultExport: boolean;
  } = {
    body: {} as Body,
    export: false,
    defaultExport: false,
  }
): IInterfaceBuilder<Name, Generics, Body, Exported, Extend> {
  function build(): string {
    const extendsStr = defaultOptions.extends
      ? ` extends ${writeType(defaultOptions.extends)}`
      : '';
    const exportStr = defaultOptions.export
      ? `${defaultOptions.defaultExport ? 'default ' : ''} export `
      : '';
    return `${exportStr}interface ${interfaceName}${writeGeneric(
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
    markExport: (defaultExport = false) =>
      interfaceBuilder(interfaceName, {
        ...defaultOptions,
        export: true,
        defaultExport,
      }),
    get body() {
      return defaultOptions.body;
    },
    get generics() {
      return (defaultOptions.generics ?? []) as Generics;
    },
    as() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return this as any;
    },
  };
}
