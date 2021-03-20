import { OpenAPIV3 } from 'openapi-types';
import * as tscgen from 'tscgen';

export type SchemaHandlers = {
  handleReference: (
    refName: string,
    assigner: {
      setType: (type: tscgen.IType) => void;
      addImport: (value: tscgen.IImportBuilder[]) => void;
    }
  ) => tscgen.Promiseable<void>;
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

type WriteSchemaReturnType = {
  type: tscgen.IType;
  imports: tscgen.IImportBuilder[];
};

type TypeHandler<T> = (
  obj: T,
  schemaHandlers: SchemaHandlers & IWriteSchemaTypeHandlers
) => tscgen.Promiseable<WriteSchemaReturnType>;

export interface IWriteSchemaTypeHandlers {
  handleOneOf: TypeHandler<
    (OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject)[]
  >;
  handleAllOf: TypeHandler<
    (OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject)[]
  >;
  handleObjectType: TypeHandler<OpenAPIV3.NonArraySchemaObject>;
  handleArrayType: TypeHandler<OpenAPIV3.ArraySchemaObject>;
  handleStringType: TypeHandler<OpenAPIV3.NonArraySchemaObject>;
  handleNumberType: TypeHandler<OpenAPIV3.NonArraySchemaObject>;
  handleBooleanType: TypeHandler<OpenAPIV3.NonArraySchemaObject>;
}

const handleAllOf: IWriteSchemaTypeHandlers['handleAllOf'] = async (
  allOf,
  handlers
) => {
  const values = await Promise.all(
    allOf.map((prop) => writeSchema(prop, handlers))
  );
  return {
    type: tscgen.intersectionType(...values.map((prop) => prop.type)),
    imports: values.flatMap((val) => val.imports),
  };
};

const handleOneOf: IWriteSchemaTypeHandlers['handleOneOf'] = async (
  oneOf,
  handlers
) => {
  const values = await Promise.all(
    oneOf.map((prop) => writeSchema(prop, handlers))
  );
  return {
    type: tscgen.unionType(...values.map((prop) => prop.type)),
    imports: values.flatMap((val) => val.imports),
  };
};

const handleObjectType: IWriteSchemaTypeHandlers['handleObjectType'] = async (
  obj,
  handlers
) => {
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
    type: tscgen.objectType(tscgen.mapObject(withSchema, (val) => val.type)),
    imports: Object.entries(withSchema).flatMap((val) => val[1].imports),
  };
};

const handleArrayType: IWriteSchemaTypeHandlers['handleArrayType'] = async (
  obj,
  handlers
) => {
  const newSchema = await writeSchema(obj.items!, handlers);
  return {
    type: tscgen.arrayType(newSchema.type),
    imports: newSchema.imports,
  };
};

const handleStringType: IWriteSchemaTypeHandlers['handleStringType'] = async (
  obj
) => {
  return {
    type: tscgen.stringType(...(obj.enum ?? [])),
    imports: [],
  };
};

const handleNumberType: IWriteSchemaTypeHandlers['handleNumberType'] = async (
  obj
) => {
  return {
    type: tscgen.numberType(...(obj.enum ?? [])),
    imports: [],
  };
};

const handleBooleanType: IWriteSchemaTypeHandlers['handleBooleanType'] = async () => {
  return {
    type: tscgen.booleanType(),
    imports: [],
  };
};

const defaultWriteHandlers: IWriteSchemaTypeHandlers = {
  handleAllOf,
  handleOneOf,
  handleObjectType,
  handleArrayType,
  handleStringType,
  handleNumberType,
  handleBooleanType,
};

export function writeSchema(
  obj: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
  baseHandlers: SchemaHandlers & Partial<IWriteSchemaTypeHandlers>
): Promise<WriteSchemaReturnType> {
  const handlers = {
    ...baseHandlers,
    ...defaultWriteHandlers,
  };
  return handleRef(obj, {
    ref: async (ref) => {
      const importName = ref.$ref.split('/').slice(-1)[0];

      const resResult: {
        typeIdentifier?: tscgen.IType;
        imports: tscgen.IImportBuilder[];
      } = {
        imports: [],
      };

      await handlers.handleReference(importName, {
        addImport: (val) => (resResult.imports = resResult.imports.concat(val)),
        setType: (val) => {
          resResult.typeIdentifier = val;
        },
      });

      if (!resResult.typeIdentifier) {
        throw new Error('Reference not handled');
      }

      return {
        type: resResult.typeIdentifier!,
        imports: resResult.imports,
      };
    },
    notRef: async (
      obj
    ): Promise<{
      type: tscgen.IType;
      imports: tscgen.IImportBuilder[];
    }> => {
      if (obj.allOf) {
        return handlers.handleAllOf(obj.allOf, handlers);
      }

      if (obj.oneOf) {
        return handlers.handleOneOf(obj.oneOf, handlers);
      }

      switch (obj.type) {
        case 'object':
          return handlers.handleObjectType(obj, handlers);
        case 'array':
          return handlers.handleArrayType(obj, handlers);
        case 'integer':
          return handlers.handleNumberType(obj, handlers);
        case 'number':
          return handlers.handleNumberType(obj, handlers);
        case 'string':
          return handlers.handleStringType(obj, handlers);
        case 'boolean':
          return handlers.handleBooleanType(obj, handlers);
        default:
          throw new Error(`Unknown type ${obj.type}`);
      }
    },
  });
}
