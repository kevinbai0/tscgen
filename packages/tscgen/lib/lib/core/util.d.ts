import { Promiseable } from '../helpers/promise';
import { IBodyType, IObjectType } from '../typescript/types';
import { IBaseBuilder } from './builders/entityBuilder';
export declare function combine(...builders: IBaseBuilder[]): string;
export declare function mapObjectPromise<T, K>(obj: Record<string, T>, transform: (value: T, key: string) => Promiseable<K>): Promise<Record<string, K>>;
export declare function mapObject<T, K>(obj: Record<string, T>, transform: (value: T, key: string) => K): Record<string, K>;
export declare function toObjectType<T extends any[]>(arr: T | undefined, transform: (value: T[number]) => {
    key: string;
    value: IBodyType[keyof IBodyType];
} | undefined): IObjectType;
