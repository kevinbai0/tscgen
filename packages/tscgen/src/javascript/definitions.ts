import {
  IEntityBuilder,
  IEntityBuilderTypes,
} from '../core/builders/entityBuilder';
import { variableBuilder } from '../core/builders/variableBuilder';
import { IGenericValue, IType } from '../typescript/types';
import {
  IJsArrowFnDefinitionValue,
  IJsBodyValue,
  IJsFunctionCallValue,
  IJsFunctionParamValue,
  IJsIdentifierValue,
  IJsObjectValue,
  IJsProperties,
  IJsValue,
  INullValue,
  IUndefinedValue,
} from './types';

/**
 * Create a Javascript object
 * @param value - {@link IJsBodyValue} of the object
 * @returns
 * @public
 */
export function objectValue(value: IJsBodyValue): IJsObjectValue {
  return {
    type: 'object',
    value,
  };
}

/**
 * Create a reference to another variable declared by a {@link IEntityBuilder}
 * @param builder - The name of the interace/type
 * @param extract - Properties to extract for the identifier (eg: ITest[number][string])
 * @returns IJSIdentfierValue
 * @public
 */
export function identifierValue<
  Type extends IEntityBuilderTypes,
  Name extends string
>(builder: IEntityBuilder<Type, Name>): IJsIdentifierValue {
  return {
    type: 'identifier',
    value: builder.varName,
  };
}

export function fnParam<Key extends string>(
  key: Key,
  type: IType
): IJsFunctionParamValue<Key> {
  return {
    type: 'function_param',
    value: {
      key,
      type,
    },
  };
}

type InjectedParams<Params extends IJsFunctionParamValue[]> = (
  injected: Record<Params[number]['value']['key'], IJsIdentifierValue>
) => IJsValue;

export function arrowFunctionValue<Params extends IJsFunctionParamValue[]>(
  ...params: Params
) {
  function returns(generics: IGenericValue[]) {
    return (
      value: IJsValue | InjectedParams<Params>,
      type?: IType
    ): IJsArrowFnDefinitionValue => {
      const returnValue = (() => {
        if (typeof value === 'function') {
          const injectedParams = params.reduce(
            (acc, param) => ({
              ...acc,
              [param.value.key]: identifierValue(
                variableBuilder(param.value.key)
              ),
            }),
            {} as Record<Params[number]['value']['key'], IJsIdentifierValue>
          );

          return value(injectedParams);
        }
        return value;
      })();
      return {
        type: 'arrow_function',
        value: {
          generic: generics,
          params: params,
          returnType: type,
          returnValue: returnValue,
        },
      };
    };
  }
  return {
    addGenerics(...generics: IGenericValue[]) {
      return {
        returns: returns(generics),
      };
    },
    returns: returns([]),
  };
}

export function undefinedValue(): IUndefinedValue {
  return {
    type: 'undefined',
  };
}

export function nullValue(): INullValue {
  return {
    type: 'null',
  };
}

export function valueProperties(
  value: IJsValue,
  ...properties: IJsValue[]
): IJsProperties {
  return {
    type: 'value_properties',
    value,
    properties,
  };
}

export function callFunction(
  value: IJsArrowFnDefinitionValue | IJsIdentifierValue,
  params: IJsValue[],
  genericCalls?: IType[]
): IJsFunctionCallValue {
  return {
    type: 'function_call',
    value,
    params,
    genericCalls,
  };
}
