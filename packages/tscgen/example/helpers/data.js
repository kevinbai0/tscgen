"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaths = exports.getSchemas = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let openApiData;
const getData = () => {
    if (!openApiData) {
        const file = fs_1.default.readFileSync(path_1.default.join(__dirname, '../main.json'), 'utf-8');
        openApiData = JSON.parse(file);
        return openApiData;
    }
    return openApiData;
};
const getSchemas = () => {
    const data = getData();
    if (!data.components?.schemas) {
        return [];
    }
    return Object.keys(data.components.schemas).map((schemaKey) => {
        return {
            name: schemaKey,
            schema: data.components.schemas[schemaKey],
        };
    });
};
exports.getSchemas = getSchemas;
const operators = [
    'get',
    'put',
    'post',
    'delete',
    'patch',
    'head',
    'options',
    'trace',
];
const getPaths = () => {
    const data = getData();
    const paths = Object.entries(data.paths).flatMap(([route, pathInfo]) => parsePathInfo(pathInfo).map((info) => ({
        route,
        pathInfo: info,
    })));
    return paths;
};
exports.getPaths = getPaths;
function parsePathInfo(pathInfo) {
    const params = pathInfo.parameters ?? [];
    return operators
        .filter((op) => pathInfo[op])
        .map((op) => ({
        ...pathInfo[op],
        parameters: [...(pathInfo[op]?.parameters ?? []), ...params],
        method: op,
    }));
}
