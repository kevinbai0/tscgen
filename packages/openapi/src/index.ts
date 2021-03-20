import { combine, typeAliasBuilder } from 'tscgen';
import { register, registerAll, writeApplication } from 'tscgen-framework';
import { IModel } from './schema/data';
import { writeSchema } from './schema/writeSchema';

export const models = register('models/[name].ts')
  .setInputShape<IModel>()
  .generate(async ({ params, data, context }) => {
    const body = await writeSchema(data.schema, {
      handleReference: async (importName, handler) => {
        const match = await context.getReference<App>()(
          'models/[name].ts',
          'routes',
          (value) => value.data.name === importName
        );
        handler.setType(match.type);
        handler.addImport(match.imports);
      },
    });

    return {
      imports: body.imports,
      exports: {
        get routes() {
          return typeAliasBuilder(params.name).markExport().addUnion(body.type);
        },
      },
    };
  });

type T = typeof models;

const promise = registerAll(models);

export const app = promise.setInputs({
  'models/[name].ts': [
    {
      data: {
        name: 'Test',
        schema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
          },
        },
      },
      params: {
        name: 'Test',
      },
    },
  ],
});

type App = typeof app;

async function main() {
  const val = await app;
  await writeApplication(val);
}
main().catch(console.error);
