import {
  arrowFunctionValue,
  fnParam,
  stringType,
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
import { register, IStaticReferenceResponse } from 'tscgen-framework';
import { createRequestComponent, responseMessageComponent } from '..';
import { IPath } from '../schema/data';
import { routes } from './routes';

export const getPath = __filename;

export const endpoints = register('api/[path]/[endpoint].ts')
  .setInputShape<IPath>()
  .generate(async ({ data, context }) => {
    const referencedRoute = await context.getGlobalReference(
      routes,
      ['route'],
      (inp) =>
        inp.data.route === data.route &&
        inp.data.pathInfo.method === data.pathInfo.method
    );

    const route = referencedRoute.entities[0];

    const createRequest = await new Promise<
      IStaticReferenceResponse<IJsIdentifierValue>
    >((resolve) => {
      resolve(
        context.getStaticReference(
          createRequestComponent,
          'createRequest',
          'js_identifier'
        )
      );
    });

    const ResponseMessage = await new Promise<IStaticReferenceResponse>(
      (resolve) => {
        resolve(
          context.getStaticReference(
            responseMessageComponent,
            'ResponseMessage',
            'type_identifier'
          )
        );
      }
    );

    const responseGeneric = genericProperties(
      ResponseMessage.identifier,
      typeProperties(identifierType(route), stringType('responses'))
    );

    const interfaceAssert = tryPipe(route).assert(
      isInterface,
      (val) => val.body
    );

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
        ...createRequest.imports,
        ...ResponseMessage.imports,
        ...referencedRoute.imports,
      ],
      exports: {
        defaultExport: variableBuilder(data.pathInfo.operationId!)
          .setAssignment(
            arrowFunctionValue(
              ...[...fnParams, ...(dataParam ? [dataParam] : [])]
            ).returns((fnParams) =>
              callFunction(
                createRequest.identifier,
                [apiStr, objectValue(getBody(fnParams))],
                [responseGeneric]
              )
            )
          )
          .markExport(true),
      },
    };
  });
