export type FindPetsRoute = {
  method: 'get';
  path: '/pets';
  params: undefined;
  query: { tags?: string; limit?: string };
  requestBody: never;
  combined: { tags?: string; limit?: string };
};
