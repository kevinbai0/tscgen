export interface IBaseBuilder {
  type: string;
  toString(): string;
  varName: string;
  markExport(): IBaseBuilder;
}
