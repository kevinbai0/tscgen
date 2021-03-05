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
  getPath: string
) {
  const inputs = await Promise.resolve(getInputs());

  const state: [
    TSCGenInputs<Inputs>,
    Exports | undefined
  ][] = inputs.map((val) => [val, undefined]);

  const context: Context<Inputs, Exports> = {
    referenceIdentifier: ({ findOne, pick }) => {
      const found = state.find(([inputData]) => findOne(inputData));
      if (!found) {
        throw new Error(`No reference found`);
      }

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
  return res;
}
