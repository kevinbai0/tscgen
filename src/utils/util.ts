import { IBaseBuilder, IBaseBuilderTypes } from '../builders/baseBuilder';
import { IBodyType, IObjectType } from '../types';

export function combine(
  ...builders: IBaseBuilder<IBaseBuilderTypes, string>[]
): string {
  return builders.map((builder) => builder.toString()).join('\n\n');
}

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toObjectType<T extends any[]>(
  arr: T | undefined,
  transform: (
    value: T[number]
  ) => { key: string; value: IBodyType[keyof IBodyType] }
): IObjectType {
  if (!arr) {
    return {
      type: 'object',
      definition: {},
    };
  }
  const body = arr.reduce<IBodyType>((acc, value) => {
    const res = transform(value);
    return { ...acc, [res.key]: res.value };
  }, {});

  return {
    type: 'object',
    definition: body,
  };
}
