import {
  IEntityBuilder,
  IEntityBuilderTypes,
} from '../core/builders/entityBuilder';
import { IJsBodyValue, IJsIdentifierValue, IJsObjectValue } from './types';

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
