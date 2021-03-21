import { typeAliasBuilder } from 'tscgen';
import { register } from 'tscgen-framework';
import { App } from '..';
import { IModel } from '../schema/data';
import { writeSchema } from '../schema/writeSchema';

export const models = register('models/[name].ts')
  .setInputShape<IModel>()
  .generate(async ({ params, data, context }) => {
    const body = await writeSchema(data.schema, {
      handleReference: async (importName, handler) => {
        const match = await context.getCircularReference<App>()(
          'model',
          (value) => value.data.name === importName
        );
        handler.setType(match.identifier);
        handler.addImport(match.imports);
      },
    });

    return {
      imports: body.imports,
      exports: {
        get model() {
          return typeAliasBuilder(params.name).markExport().addUnion(body.type);
        },
      },
    };
  });
