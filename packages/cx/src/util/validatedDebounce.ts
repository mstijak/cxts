interface ResetableDebounceCallback {
  (...args): void;
  reset(): void;
}

export function validatedDebounce(
  callback: (...args) => void,
  valueGetter: () => any,
  delay: number
): ResetableDebounceCallback {
  let timer;
  let result: any = function (...args) {
    clearTimeout(timer);
    let prev = valueGetter();
    timer = setTimeout(function () {
      let now = valueGetter();
      if (prev !== now) return;
      callback(...args);
    }, delay);
  };

  result.reset = function reset(...args) {
    clearTimeout(timer);
    callback(...args);
  };

  return result;
}
