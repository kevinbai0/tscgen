import {
  IEntityBuilder,
  IEntityBuilderTypes,
} from '../core/builders/entityBuilder';
import { IJsBodyValue, IJsIdentifierValue, IJsObjectValue } from './types';

export function objectValue(value: IJsBodyValue): IJsObjectValue {
  return {
    type: 'object',
    value,
  };
}

/**
 *
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
