import { IGenericValue, IType, IBodyType, IGenericOptions } from './types';
export declare function writeGeneric(values?: Readonly<IGenericValue<string, IGenericOptions>[]>): string;
export declare function writeType(type: IType | undefined): string;
export declare function writeBodyType(body: IBodyType): string;
