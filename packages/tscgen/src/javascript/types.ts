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

export type IJsStringValue = string;
export type IJsNumberValue = number;
export type IJsBooleanValue = boolean;
export type IJsArrayValue = IJsValue[];

export interface IJsObjectValue {
  type: 'object';
  value: IJsBodyValue;
}

export interface IJsBodyValue {
  [key: string]: IJsValue;
}
