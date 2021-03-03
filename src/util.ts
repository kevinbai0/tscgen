import { IBaseBuilder, IBaseBuilderTypes } from './builders/types';

export function combine(
  ...builders: IBaseBuilder<IBaseBuilderTypes, string>[]
): string {
  return builders.map((builder) => builder.toString()).join('\n\n');
}

export function mapObject<T, K>(
  obj: Record<string, T>,
  transform: (value: T) => K
): Record<string, K> {
  return Object.entries(obj).reduce<Record<string, K>>(
    (acc, [key, value]) => ({
      ...acc,
      [key]: transform(value),
    }),
    {}
  );
}
