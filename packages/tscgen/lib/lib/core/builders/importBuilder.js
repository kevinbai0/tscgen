"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importBuilder = void 0;
const write_1 = require("../../common/write");
function importBuilder(defaultOptions = {
    modules: [],
}) {
    function build() {
        if (!defaultOptions.location) {
            throw new Error('Import is missing location');
        }
        if (defaultOptions.allModules && defaultOptions.modules.length) {
            console.warn('Both all modules and individual modules are exported, only all modules will be used');
        }
        const moduleStr = (() => {
            const defaultModule = defaultOptions.defaultImport
                ? write_1.writeImport({
                    type: 'import_default',
                    value: defaultOptions.defaultImport,
                })
                : '';
            if (defaultOptions.allModules) {
                return `${defaultModule ? `${defaultModule}, ` : ''}${write_1.writeImport({
                    type: 'import_all_modules',
                    value: defaultOptions.allModules,
                })}`;
            }
            if (defaultOptions.modules.length) {
                const modules = defaultOptions.modules.map(write_1.writeImport).join(',');
                return `${defaultModule ? `${defaultModule}, ` : ''}{${modules}}`;
            }
            return defaultModule;
        })();
        const location = write_1.writeImport({
            type: 'import_location',
            value: defaultOptions.location,
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
        addModules: (...modules) => importBuilder({
            ...defaultOptions,
            modules: [
                ...defaultOptions.modules,
                ...modules.map((module) => module.type === 'import_lazy'
                    ? module
                    : {
                        type: 'import_module',
                        value: module,
                    }),
            ],
        }),
        addDefaultImport: (name) => importBuilder({
            ...defaultOptions,
            defaultImport: name,
        }),
        addAllModuleImports: (name) => importBuilder({
            ...defaultOptions,
            allModules: name,
        }),
        addImportLocation: (name) => importBuilder({
            ...defaultOptions,
            location: name,
        }),
    };
}
exports.importBuilder = importBuilder;
