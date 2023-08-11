import { CSSTool } from "./CSS";

var cssHelperCache = {};

export class CSSHelper {
  static get(code: string): CSSTool {
    var helper = cssHelperCache[code];
    if (!helper) throw new Error(`Unknown CSS helper '${code}'.`);
    return helper;
  }

  static register(code: string, helper: CSSTool) {
    cssHelperCache[code] = helper;
  }

  static alias(code: string, helper: CSSTool) {
    cssHelperCache[code] = helper;
  }
}
