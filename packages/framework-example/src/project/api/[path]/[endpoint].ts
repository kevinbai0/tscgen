import {
  arrowFunctionValue,
  fnParam,
  stringType,
  identifierValue,
  variableBuilder,
  callFunction,
  identifierType,
  genericProperties,
  typeProperties,
  tryPipe,
  hasBodyProperty,
  isInterface,
  isRequiredProperty,
  isObjectType,
  isSingleStringLiteral,
  objectValue,
  objectType,
  isUndefinedType,
  valueProperties,
  IJsIdentifierValue,
  IJsBodyValue,
} from 'tscgen';
import { getReference, getStaticReference, register } from 'tscgen-framework';

export const getPath = __filename;

const outputs = register(`defaultExport`).withInputs(async () => {
  const values = await getReference(
    import('../../routes/[route]'),
    getPath,
    {}
  );
  const inputs = await values.referenceInputs();

  return inputs.map((input) => ({
    ...input,
    params: {
      path: input.data.route.replace(/[{}]/g, ''),
      endpoint: input.data.pathInfo.method,
    },
  }));
});

export default outputs.generateExports(async ({ data, params }) => {
  const reference = await getReference(
    import('../../routes/[route]'),
    getPath,
    params
  );
  const foundRoutes = await reference
    .referenceExports('route')
    .filter((inp) => {
      return (
        inp.data.route === data.route &&
        inp.data.pathInfo.method === data.pathInfo.method
      );
    });

  const route = foundRoutes.exports[0].as('interface');

  const createRequest = getStaticReference(
    '../../request.static.ts',
    getPath,
    params
  )
    .getReference('createRequest')
    .asVariable();
  const ResponseMessage = getStaticReference(
    '../../ResponseMessage.static.ts',
    getPath,
    params
  )
    .getReference('ResponseMessage')
    .asTypeAlias();

  const responseGeneric = genericProperties(
    identifierType(ResponseMessage.exports[0]),
    typeProperties(
      identifierType(foundRoutes.exports[0]),
      stringType('responses')
    )
  );

  const interfaceAssert = tryPipe(route).assert(isInterface, (val) => val.body);

  const paramsObjType = interfaceAssert
    .assert(hasBodyProperty('params'), (val) => val.params)
    .assert(isRequiredProperty)
    .assert(isObjectType, (val) => val.definition)
    .validate();

  const paramSet = Object.keys(paramsObjType ?? {});
  const fnParams = paramsObjType
    ? Object.keys(paramsObjType).map((key) => fnParam(key, stringType()))
    : [];
  const apiPath = interfaceAssert
    .assert(hasBodyProperty('path'), (val) => val.path)
    .assert(isRequiredProperty)
    .assert(isSingleStringLiteral, (val) => val.definition[0].definition)
    .validate();

  const hasBody = !interfaceAssert
    .assert(hasBodyProperty('requestBody'), (val) => val.requestBody)
    .assert(isRequiredProperty)
    .assert(isUndefinedType)
    .validate();
  const hasQuery = !interfaceAssert
    .assert(hasBodyProperty('query'), (val) => val.query)
    .assert(isRequiredProperty)
    .assert(isUndefinedType)
    .validate();

  const dataParam = (() => {
    if (hasBody && hasQuery) {
      return fnParam(
        'data',
        objectType({
          body: typeProperties(
            identifierType(route),
            stringType('requestBody')
          ),
          query: typeProperties(identifierType(route), stringType('query')),
        })
      );
    }
    if (hasBody) {
      return fnParam(
        'data',
        typeProperties(identifierType(route), stringType('requestBody'))
      );
    }
    if (hasQuery) {
      return fnParam(
        'data',
        typeProperties(identifierType(route), stringType('query'))
      );
    }
  })();

  const apiStr = paramSet.reduce(
    (acc, val) => acc.replace(`{${val}}`, `$\{${val}}`),
    apiPath ?? ''
  );

  const getBody = (fnParams: Record<string, IJsIdentifierValue>) => {
    const body: IJsBodyValue =
      hasBody && hasQuery
        ? {
            body: valueProperties(fnParams.data, 'body'),
            query: valueProperties(fnParams.data, 'query'),
          }
        : hasBody
        ? {
            body: fnParams.data,
          }
        : hasQuery
        ? {
            query: fnParams.data,
          }
        : {};
    return {
      ...body,
      method: data.pathInfo.method,
    };
  };

  return {
    imports: [
      createRequest.import,
      ResponseMessage.import,
      ...foundRoutes.imports,
    ],
    exports: {
      defaultExport: variableBuilder(data.pathInfo.operationId!)
        .setAssignment(
          arrowFunctionValue(
            ...[...fnParams, ...(dataParam ? [dataParam] : [])]
          ).returns((fnParams) =>
            callFunction(
              identifierValue(createRequest.exports[0]),
              [apiStr, objectValue(getBody(fnParams))],
              [responseGeneric]
            )
          )
        )
        .markExport(true),
    },
  };
});
