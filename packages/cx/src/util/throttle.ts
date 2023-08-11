/**
 * Returns a function, that, after it is invoked, will trigger the `callback` function,
 * after the `delay` amount of milliseconds has passed. During that time, all subsequent calls are
 * ignored. All arguments are passed to the `callback` function.
 * @param callback
 * @param delay - Delay in milliseconds.
 * @returns {Function}
 */
export function throttle(
  callback: (...args: any[]) => void,
  delay: number
): (...args: any[]) => void {
  let timer, context, lastArgs;

  return function (...args) {
    context = this;
    lastArgs = args;
    if (!timer)
      timer = setTimeout(function () {
        callback.apply(context, lastArgs);
        timer = null;
      }, delay);
  };
}
