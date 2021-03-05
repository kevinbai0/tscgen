export type Promiseable<T> = T | Promise<T>;
export type Unpromise<T> = T extends Promise<infer U> ? U : never;
