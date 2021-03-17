import { OpenAPIV3 } from 'openapi-types';
import * as tscgen from 'tscgen';

export const operators = [
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
] as const;
export type Operator = typeof operators[number];

export type SchemaHandlers = {
  resolveReference: (
    refName: string
  ) => tscgen.Promiseable<{
    typeIdentifier: tscgen.IType;
    importValue: tscgen.IImportBuilder;
  }>;
};

export const filterUndefined = <T>(arr: (T | undefined)[]) => {
  return arr.filter((val) => !!val) as T[];
};

export const handleRef = <T, K>(
  ref: T | OpenAPIV3.ReferenceObject,
  options: {
    ref: (obj: OpenAPIV3.ReferenceObject) => K;
    notRef: (obj: T) => K;
  }
) => {
  if ((ref as OpenAPIV3.ReferenceObject)?.$ref) {
    return options.ref(ref as OpenAPIV3.ReferenceObject);
  }
  return options.notRef(ref as T);
};

export const writeSchema = (
  obj: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
  handlers: SchemaHandlers
): Promise<{
  type: tscgen.IType;
  imports: tscgen.IImportBuilder[];
}> => {
  return handleRef(obj, {
    ref: async (ref) => {
      const importName = ref.$ref.split('/').slice(-1)[0];

      const res = await handlers.resolveReference(importName);

      return {
        type: res.typeIdentifier,
        imports: [res.importValue],
      };
    },
    notRef: async (
      obj
    ): Promise<{
      type: tscgen.IType;
      imports: tscgen.IImportBuilder[];
    }> => {
      if (obj.allOf) {
        const allOf = await Promise.all(
          obj.allOf.map((prop) => writeSchema(prop, handlers))
        );
        return {
          type: tscgen.intersectionType(...allOf.map((prop) => prop.type)),
          imports: allOf.flatMap((val) => val.imports),
        };
      }

      if (obj.oneOf) {
        const oneOf = await Promise.all(
          obj.oneOf.map((prop) => writeSchema(prop, handlers))
        );
        return {
          type: tscgen.unionType(...oneOf.map((prop) => prop.type)),
          imports: oneOf.flatMap((val) => val.imports),
        };
      }

      if (obj.type === 'object' || obj.properties) {
        const required = new Set(obj.required ?? []);

        const withSchema = await tscgen.mapObjectPromise(
          obj.properties ?? {},
          async (value, key) => {
            const newSchema = await writeSchema(value, handlers);
            return {
              type: [
                newSchema.type,
                required.has(key),
              ] as tscgen.IBodyType[keyof tscgen.IBodyType],
              imports: newSchema.imports,
            };
          }
        );
        return {
          type: tscgen.objectType(
            tscgen.mapObject(withSchema, (val) => val.type)
          ),
          imports: Object.entries(withSchema).flatMap((val) => val[1].imports),
        };
      } else if (obj.type === 'array') {
        const newSchema = await writeSchema(obj.items!, handlers);
        return {
          type: tscgen.arrayType(newSchema.type),
          imports: newSchema.imports,
        };
      } else if (obj.type === 'number' || obj.type === 'integer') {
        return {
          type: tscgen.numberType(...(obj.enum ?? [])),
          imports: [],
        };
      } else if (obj.type === 'string') {
        return {
          type: tscgen.stringType(...(obj.enum ?? [])),
          imports: [],
        };
      } else if (obj.type === 'boolean') {
        return {
          type: tscgen.booleanType(),
          imports: [],
        };
      }
      throw new Error(`Unknown type ${obj.type}`);
    },
  });
};
