import { Promiseable } from '../helpers/promise';
import { IBodyType, IObjectType } from '../typescript/types';
import { IBaseBuilder } from './builders/entityBuilder';

/**
 * Combines builders and outputs the generated string of the builders sequentially
 * @param builders - pass in a variadic number of builders to generate the output string of
 * @returns the generated output string
 */
export function combine(...builders: IBaseBuilder[]): string {
  return builders
    .map((builder) =>
      builder.type === 'import' ? builder.toString() : `\n${builder.toString()}`
    )
    .join('\n');
}

/**
 * Maps the values of each of value to a new one asynchronously
 * @param obj - the object to map
 * @param transform - callback that returns the new value for each key/value pair (can be a promise)
 * @returns The new transformed object as a Record wrapped in a promise
 * @public
 */
export async function mapObjectPromise<T, K>(
  obj: Record<string, T>,
  transform: (value: T, key: string) => Promiseable<K>
): Promise<Record<string, K>> {
  return (
    await Promise.all(
      Object.entries(obj).map(
        async ([key, value]) =>
          [key, await Promise.resolve(transform(value, key))] as const
      )
    )
  ).reduce<Record<string, K>>(
    (acc, [key, value]) => ({
      ...acc,
      [key]: value,
    }),
    {}
  );
}

/**
 * Maps the values of each of value to a new one synchronously
 * @param obj - object of type Record<string, any> to map
 * @param transform - callback that returns the new value for each key/value pair
 * @returns The new transformed object as a Record
 * @public
 */
export function mapObject<T, K>(
  obj: Record<string, T>,
  transform: (value: T, key: string) => K
): Record<string, K> {
  return Object.entries(obj).reduce<Record<string, K>>(
    (acc, [key, value]) => ({
      ...acc,
      [key]: transform(value, key),
    }),
    {}
  );
}

/**
 * Transform an array to an {@link IObjectType}
 * @param arr - An array that contains the values for an object
 * @param transform - Transforms each element into a key, and IBodyType
 * @returns
 */
export function toObjectType<T extends unknown[]>(
  arr: T | undefined,
  transform: (
    value: T[number]
  ) => { key: string; value: IBodyType[keyof IBodyType] } | undefined
): IObjectType {
  if (!arr) {
    return {
      type: 'object',
      definition: {},
    };
  }
  const body = arr.reduce<IBodyType>((acc, value) => {
    const res = transform(value);
    if (!res) {
      return acc;
    }
    return { ...acc, [res.key]: res.value };
  }, {});

  return {
    type: 'object',
    definition: body,
  };
}
