"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStaticExports = exports.getPath = void 0;
const tscgen = __importStar(require("../../src/framework"));
const _route_1 = require("./routes/[route]");
exports.getPath = __filename;
exports.getStaticExports = tscgen.createStaticExports('Route', 'Routes', 'RoutesData', 'routesData')(async () => {
    const references = await tscgen.getReference(Promise.resolve().then(() => __importStar(require('./routes/[route]'))), __filename);
    const { imports, exports } = await references
        .referenceMappedExports('route')
        .filter(() => true);
    const pathsData = await _route_1.getInputs();
    return {
        imports,
        exports: {
            Route: tscgen
                .typeDefBuilder('Route')
                .markExport()
                .addUnion(...exports.map((builder) => tscgen.identifierType(builder))),
            Routes: tscgen
                .typeDefBuilder('Routes')
                .markExport()
                .addUnion(tscgen.toObjectType(exports, (value) => {
                return {
                    key: value.varName,
                    value: tscgen.identifierType(value),
                };
            })),
            RoutesData: tscgen
                .typeDefBuilder('RoutesData')
                .addUnion(tscgen.objectType({
                [`[Key in keyof Routes]`]: tscgen.objectType({
                    route: tscgen.rawType(`Routes[Key]['path']`),
                    method: tscgen.rawType(`Routes[Key]['method']`),
                }),
            }))
                .markExport(),
            get routesData() {
                return tscgen
                    .varObjectBuilder('routesData')
                    .markExport()
                    .addTypeDef(tscgen.identifierType(this.RoutesData))
                    .addBody(pathsData.reduce((acc, data) => ({
                    ...acc,
                    [data.params.route]: tscgen.objectValue({
                        route: data.data.route,
                        method: data.data.pathInfo.method,
                    }),
                }), {}));
            },
        },
    };
});
