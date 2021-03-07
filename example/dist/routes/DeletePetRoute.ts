export interface DeletePetRoute {
  method: 'delete';
  path: '/pets/{id}';
  params: { id: string };
  query: undefined;
  requestBody: never;
}
