import {
  identifierType,
  IEntityBuilder,
  importBuilder,
  lazyType,
} from '../lib';
import { lazyImportType, importModuleType } from '../lib/common/definitions';
import { getFilename } from './getFilename';
import {
  Context,
  GetInputs,
  GetMappedExports,
  TSCGenInputs,
  BuilderExports,
} from './types';

export async function createContext<
  Inputs extends GetInputs,
  Exports extends ReadonlyArray<string>
>(
  getInputs: Inputs,
  mappedExports: GetMappedExports<Inputs, Exports>,
  getPath: string,
  options?: {
    filter?: (data: TSCGenInputs<Inputs>) => boolean;
  }
) {
  const inputs = await Promise.resolve(getInputs());

  const state: [
    inputData: TSCGenInputs<Inputs>,
    exportsValue:
      | BuilderExports<Exports, false>['exports']['values']
      | undefined
  ][] = inputs.map((val) => [val, undefined]);

  const context: Context<Inputs, Exports> = {
    referenceIdentifier: (pick) => {
      return {
        findOne: (method) => {
          const foundIndex = state.findIndex(([inputData]) =>
            method(inputData)
          );
          if (foundIndex === -1) {
            throw new Error(`No reference found`);
          }
          const found = state[foundIndex];
          return {
            importValue: importBuilder()
              .addModules(
                lazyImportType(() => importModuleType(found[1]![pick]))
              )
              .addImportLocation(
                getFilename(getPath, getPath, found[0].params)
              ),
            typeIdentifier: lazyType(() => {
              return identifierType(found[1]![pick]);
            }),
          };
        },
      };
    },
  };

  const res = await Promise.all(
    inputs.map(async (inputData, index) => {
      const outputData = await mappedExports({
        ...inputData,
        context,
      });

      // update context
      state[index][1] = outputData.exports.values;

      return {
        inputData,
        ...outputData,
      };
    })
  );

  return res.filter((val) => options?.filter?.(val.inputData) ?? true);
}

type ExportsWithEntity<T> = {
  [Key in keyof T]: T[Key] extends string
    ? {
        key: T[Key];
        entity: IEntityBuilder;
      }
    : never;
};
