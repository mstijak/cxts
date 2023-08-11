export const Console = {
  log: function (...args) {
    if (typeof window != "undefined" && window.console) console.log(...args);
  },

  warn: function (...args) {
    if (typeof window != "undefined" && window.console) console.warn(...args);
  },
};
