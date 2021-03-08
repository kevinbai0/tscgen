import { IJsBodyValue, IJsNumberValue, IJsStringValue, IJsBooleanValue, IJsValue, IJsArrayValue, IJsObjectValue, IJsIdentifierValue } from './types';
export declare function writeJsNumber(value: IJsNumberValue): string;
export declare function writeJsString(value: IJsStringValue): string;
export declare function writeJsBoolean(value: IJsBooleanValue): string;
export declare function writeJsObject(value: IJsObjectValue): string;
export declare function writeJsArray(value: IJsArrayValue): string;
export declare function writeJsIdentifier(value: IJsIdentifierValue): string;
export declare function writeJsBody(body: IJsBodyValue): string;
export declare function writeJsValue(value: IJsValue): string;
