export declare type IJsValue = IJsStringValue | IJsBooleanValue | IJsNumberValue | IJsArrayValue | IJsObjectValue | IJsIdentifierValue;
export interface IJsIdentifierValue {
    type: 'identifier';
    value: string;
}
export declare type IJsStringValue = string;
export declare type IJsNumberValue = number;
export declare type IJsBooleanValue = boolean;
export declare type IJsArrayValue = IJsValue[];
export interface IJsObjectValue {
    type: 'object';
    value: IJsBodyValue;
}
export interface IJsBodyValue {
    [key: string]: IJsValue;
}
