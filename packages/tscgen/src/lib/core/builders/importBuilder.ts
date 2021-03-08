import { IImportLazyType, IImportModuleType } from '../../common/types';
import { writeImport } from '../../common/write';
import {
  IBaseBuilder,
  IEntityBuilder,
  IEntityBuilderTypes,
} from './entityBuilder';

export type BuildersToImport<T> = {
  [Key in keyof T]: T[Key] extends IEntityBuilder<IEntityBuilderTypes, string>
    ? IImportModuleType<T[Key]>
    : never;
};

export interface IImportBuilder<
  Module extends ReadonlyArray<IImportModuleType> = ReadonlyArray<IImportModuleType>,
  AllModules extends string | undefined = string | undefined,
  DefaultImport extends string | undefined = string | undefined,
  Location extends string | undefined = string | undefined
> extends IBaseBuilder<'import'> {
  type: 'import';
  addModules: <
    T extends ReadonlyArray<IEntityBuilder | IImportLazyType<IImportModuleType>>
  >(
    ...builder: T
  ) => IImportBuilder<
    [...Module, ...BuildersToImport<T>],
    AllModules,
    DefaultImport,
    Location
  >;
  addDefaultImport: <T extends string>(
    name: T
  ) => IImportBuilder<Module, AllModules, T, Location>;
  addAllModuleImports: <T extends string>(
    name: T
  ) => IImportBuilder<Module, T, DefaultImport, Location>;
  addImportLocation: <T extends string>(
    name: T
  ) => IImportBuilder<Module, AllModules, DefaultImport, T>;
}

export function importBuilder<
  Module extends ReadonlyArray<IImportModuleType> = [],
  AllModules extends string | undefined = undefined,
  DefaultImport extends string | undefined = undefined,
  Location extends string | undefined = undefined
>(
  defaultOptions: {
    modules: ReadonlyArray<IImportModuleType>;
    allModules?: AllModules;
    defaultImport?: DefaultImport;
    location?: Location;
  } = {
    modules: [],
  }
): IImportBuilder<Module, AllModules, DefaultImport, Location> {
  function build() {
    if (!defaultOptions.location) {
      throw new Error('Import is missing location');
    }
    if (defaultOptions.allModules && defaultOptions.modules.length) {
      console.warn(
        'Both all modules and individual modules are exported, only all modules will be used'
      );
    }
    const moduleStr = (() => {
      const defaultModule = defaultOptions.defaultImport
        ? writeImport({
            type: 'import_default',
            value: defaultOptions.defaultImport!,
          })
        : '';
      if (defaultOptions.allModules) {
        return `${defaultModule ? `${defaultModule}, ` : ''}${writeImport({
          type: 'import_all_modules',
          value: defaultOptions.allModules!,
        })}`;
      }
      if (defaultOptions.modules.length) {
        const modules = defaultOptions.modules.map(writeImport).join(',');
        return `${defaultModule ? `${defaultModule}, ` : ''}{${modules}}`;
      }
      return defaultModule;
    })();
    const location = writeImport({
      type: 'import_location',
      value: defaultOptions.location!,
    });

    if (moduleStr) {
      return `import ${moduleStr} from ${location};`;
    }
    return `import ${location};`;
  }

  return {
    type: 'import',
    toString() {
      return build();
    },
    addModules: <
      T extends ReadonlyArray<
        IEntityBuilder | IImportLazyType<IImportModuleType>
      >
    >(
      ...modules: T
    ) =>
      importBuilder({
        ...defaultOptions,
        modules: [
          ...defaultOptions.modules,
          ...((modules.map((module) =>
            module.type === 'import_lazy'
              ? module
              : {
                  type: 'import_module',
                  value: module,
                }
          ) as unknown) as BuildersToImport<T>),
        ],
      }) as IImportBuilder<
        [...Module, ...BuildersToImport<T>],
        AllModules,
        DefaultImport,
        Location
      >,
    addDefaultImport: (name) =>
      importBuilder({
        ...defaultOptions,
        defaultImport: name,
      }),
    addAllModuleImports: (name) =>
      importBuilder({
        ...defaultOptions,
        allModules: name,
      }),
    addImportLocation: (name) =>
      importBuilder({
        ...defaultOptions,
        location: name,
      }),
  };
}
