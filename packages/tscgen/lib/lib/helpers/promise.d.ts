export declare type Promiseable<T> = T | Promise<T>;
export declare type Unpromise<T> = T extends Promise<infer U> ? U : never;
