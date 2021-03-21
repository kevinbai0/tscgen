import {
  identifierType,
  importBuilder,
  lazyType,
  lazyImportType,
  importModuleType,
  IBaseBuilder,
} from 'tscgen';
import { getFilename } from './getFilename';
/*
type ContextReturnType<
  Inputs extends GetInputs,
  Exports extends ReadonlyArray<string>
> = {
  imports?: ReadonlyArray<IBaseBuilder<'import'>>;
  exports: ExportData<Exports>;
  inputData: TSCGenInputs<Inputs>;
};

export async function createContext<
  Routes extends ReadonlyArray<string>,
  Inputs extends GetInputs
>(
  getInputs: Inputs,
  mappedExports: GetMappedExports<Inputs, Routes>,
  getPath: string,
  callerParams: Record<string, string>,
  options?: {
    filter?: (data: TSCGenInputs<Inputs>) => boolean;
  }
): Promise<ContextReturnType<Inputs, Routes>[]> {
  const inputs = await Promise.resolve(getInputs());

  const state: [
    inputData: TSCGenInputs<Inputs>,
    exportsValue: BuilderExports<Routes, false>['exports']['values'] | undefined
  ][] = inputs.map((val) => [val, undefined]);

  const context: Context<Inputs, Routes> = {
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
                getFilename(getPath, getPath, found[0].params, callerParams)
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

*/
