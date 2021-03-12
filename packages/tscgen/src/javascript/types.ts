import { IGenericValue, IType } from '../typescript/types';

export type IJsValue =
  | IJsStringValue
  | IJsBooleanValue
  | IJsNumberValue
  | IJsArrayValue
  | IJsObjectValue
  | IJsIdentifierValue
  | IJsArrowFnDefinitionValue
  | IJsFunctionCallValue
  | IJsProperties
  | IUndefinedValue
  | INullValue;

export interface IJsIdentifierValue {
  type: 'identifier';
  value: string;
}

export interface IJsArrowFnDefinitionValue {
  type: 'arrow_function';
  value: {
    generic?: IGenericValue[];
    returnType?: IType;
    params: IJsFunctionParamValue[];
    returnValue: IJsValue;
  };
}

export interface IJsFunctionParamValue<Key extends string = string> {
  type: 'function_param';
  value: {
    key: Key;
    type: IType;
  };
}

export interface IJsFunctionCallValue {
  type: 'function_call';
  value: IJsArrowFnDefinitionValue | IJsIdentifierValue;
  params: IJsValue[];
  genericCalls?: IType[];
}

export type IJsStringValue = string;
export type IJsNumberValue = number;
export type IJsBooleanValue = boolean;
export type IJsArrayValue = IJsValue[];
export type IUndefinedValue = {
  type: 'undefined';
};
export type INullValue = {
  type: 'null';
};

export interface IJsProperties {
  type: 'value_properties';
  value: IJsValue;
  properties: IJsValue[];
}

export interface IJsObjectValue {
  type: 'object';
  value: IJsBodyValue;
}

export interface IJsBodyValue {
  [key: string]: IJsValue;
}
