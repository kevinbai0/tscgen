import { IImportModuleType } from '../../common/types';
import { writeImport } from '../../common/write';
import { IBaseBuilder, IBaseBuilderTypes } from './baseBuilder';

type TransformImport<T> = {
  [Key in keyof T]: T[Key] extends IBaseBuilder<IBaseBuilderTypes, string>
    ? IImportModuleType<T[Key]>
    : never;
};

interface IImportBuilder<
  Module extends ReadonlyArray<IImportModuleType>,
  AllModules extends string | undefined,
  DefaultImport extends string | undefined,
  Location extends string | undefined
> extends IBaseBuilder<'import', string> {
  type: 'import';
  addModules: <
    T extends ReadonlyArray<IBaseBuilder<IBaseBuilderTypes, string>>
  >(
    ...builder: T
  ) => IImportBuilder<
    [...Module, ...TransformImport<T>],
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
    varName: '',
    toString() {
      return build();
    },
    markExport() {
      return this;
    },
    addModules: <
      T extends ReadonlyArray<IBaseBuilder<IBaseBuilderTypes, string>>
    >(
      ...modules: T
    ) =>
      importBuilder({
        ...defaultOptions,
        modules: [
          ...defaultOptions.modules,
          ...((modules.map((module) => ({
            type: 'import_module',
            value: module,
          })) as unknown) as TransformImport<T>),
        ],
      }) as IImportBuilder<
        [...Module, ...TransformImport<T>],
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
