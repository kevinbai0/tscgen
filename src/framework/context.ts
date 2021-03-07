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
  BuilderExports,
  TSCGenInputs,
} from './types';

export async function createContext<
  Inputs extends GetInputs,
  Exports extends [...IEntityBuilder[]],
  Builders extends BuilderExports<Exports>
>(
  getInputs: Inputs,
  mappedExports: GetMappedExports<Inputs, Exports, Builders>,
  getPath: string,
  options?: {
    filter?: (data: TSCGenInputs<Inputs>) => boolean;
  }
) {
  const inputs = await Promise.resolve(getInputs());

  const state: [
    inputData: TSCGenInputs<Inputs>,
    exportsValue: Exports | undefined
  ][] = inputs.map((val) => [val, undefined]);

  const context: Context<Inputs, Exports> = {
    referenceIdentifier: ({ findOne, pick }) => {
      const foundIndex = state.findIndex(([inputData]) => findOne(inputData));
      if (foundIndex === -1) {
        throw new Error(`No reference found`);
      }
      const found = state[foundIndex];

      return {
        importValue: importBuilder()
          .addModules(lazyImportType(() => importModuleType(pick(found[1]!))))
          .addImportLocation(getFilename(getPath, getPath, found[0].params)),
        typeIdentifier: lazyType(() => {
          return identifierType(pick(found[1]!));
        }),
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
      state[index][1] = outputData.exports;

      return {
        inputData,
        ...outputData,
      };
    })
  );

  return res.filter((val) => options?.filter?.(val.inputData) ?? true);
}
