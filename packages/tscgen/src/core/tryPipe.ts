type AssertReturn<M> = {
  assert<L extends M, O>(
    assertFn: (value: M) => asserts value is L,
    callback: (value: L) => O
  ): AssertReturn<O>;
  assert<L extends M>(
    assertFn: (value: M) => asserts value is L
  ): AssertReturn<L>;
  validate: () => M | undefined;
};

function failAssert<T>(): AssertReturn<T> {
  return {
    assert: () => {
      return failAssert();
    },
    validate: () => undefined,
  };
}

export function tryPipe<T>(value: T): AssertReturn<T> {
  return {
    assert<L extends T, O>(
      fn: (v: T) => asserts v is L,
      callback?: (value: L) => O
    ) {
      try {
        fn(value);
        return tryPipe(callback?.(value) ?? value);
      } catch (err) {
        return failAssert<O>();
      }
    },
    validate: () => value,
  };
}
