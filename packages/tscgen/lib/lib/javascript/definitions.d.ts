import { IEntityBuilder, IEntityBuilderTypes } from '../core/builders/entityBuilder';
import { IJsBodyValue, IJsIdentifierValue, IJsObjectValue } from './types';
export declare function objectValue(value: IJsBodyValue): IJsObjectValue;
/**
 *
 * @param builder The name of the interace/type
 * @param extract Properties to extract for the identifier (eg: ITest[number][string])
 */
export declare function identifierValue<Type extends IEntityBuilderTypes, Name extends string>(builder: IEntityBuilder<Type, Name>): IJsIdentifierValue;
