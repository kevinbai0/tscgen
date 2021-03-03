type QueryType = 'string' | 'array';

export type Query = Record<
  string,
  | QueryType
  | {
      type: QueryType;
      required?: true;
    }
>;
export type Params = string[];

export type Breadcrumb =
  | {
      root: true;
    }
  | {
      root: false;
      dynamic: true;
      params: string[];
      template: string;
      dependsOn: string[];
    }
  | {
      root: false;
      dynamic: false;
      name: string;
      dependsOn: string[];
    };

export interface IRoute {
  route: string;
  params?: Params;
  query?: Query;
  breadcrumb: Breadcrumb;
}
