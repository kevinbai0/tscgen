import { IBodyType, IObjectType } from '../typescript/types';
import { IBaseBuilder } from './builders/entityBuilder';

export function combine(...builders: IBaseBuilder[]): string {
  return builders
    .map((builder) =>
      builder.type === 'import' ? builder.toString() : `\n${builder.toString()}`
    )
    .join('\n');
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
