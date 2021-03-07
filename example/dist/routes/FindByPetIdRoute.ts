export interface FindByPetIdRoute {
  method: 'get';
  path: '/pets/{id}';
  params: { id: string };
  query: undefined;
  requestBody: never;
}
