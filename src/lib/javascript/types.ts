export type IJsValue =
  | IJsStringValue
  | IJsBooleanValue
  | IJsNumberValue
  | IJsArrayValue
  | IJsObjectValue
  | IJsIdentifierValue;

export interface IJsIdentifierValue {
  type: 'identifier';
  value: string;
}

export interface IJsStringValue {
  type: 'string';
  value: string;
}

export interface IJsNumberValue {
  type: 'number';
  value: number;
}

export interface IJsBooleanValue {
  type: 'boolean';
  value: boolean;
}

export interface IJsArrayValue {
  type: 'array';
  value: IJsValue[];
}

export interface IJsObjectValue {
  type: 'object';
  value: IJsBodyValue;
}

export interface IJsBodyValue {
  [key: string]: IJsValue;
}
