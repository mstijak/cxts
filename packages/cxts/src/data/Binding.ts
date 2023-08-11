let bindingCache = {};
import { isString } from "../util/isString";
import { isObject } from "../util/isObject";
import { isAccessorChain } from "./createAccessorModelProxy";
import { Selector } from "../core";

export class Binding {
  path: string;
  parts: string[];

  value: Selector;

  constructor(path: string) {
    this.path = path;
    this.parts = path.split(".");
    let body = "return x";
    for (let i = 0; i < this.parts.length; i++)
      body += '?.["' + this.parts[i] + '"]';
    this.value = new Function("x", body) as any;
  }

  set(state: any, value: any) {
    let cv = this.value(state);
    if (cv === value) return state;

    let ns = Object.assign({}, state);
    let o = ns;

    for (let i = 0; i < this.parts.length; i++) {
      let part = this.parts[i];
      let no = i == this.parts.length - 1 ? value : Object.assign({}, o[part]);
      o[part] = no;
      o = no;
    }

    return ns;
  }

  delete(state: any) {
    let ns = Object.assign({}, state);
    let o = ns;
    let part;

    for (let i = 0; i < this.parts.length - 1; i++) {
      part = this.parts[i];
      let no = Object.assign({}, o[part]);
      o[part] = no;
      o = no;
    }

    part = this.parts[this.parts.length - 1];
    if (!o.hasOwnProperty(part)) return state;

    delete o[part];

    return ns;
  }

  static get(path: any): Binding {
    if (isString(path)) {
      let b = bindingCache[path];
      if (b) return b;

      b = new Binding(path);
      bindingCache[path] = b;
      return b;
    }

    if (isObject(path) && isString(path.bind)) return this.get(path.bind);

    if (path instanceof Binding) return path;

    if (isAccessorChain(path)) return this.get(path.toString());

    throw new Error("Invalid binding definition provided.");
  }
}

export function isBinding(value: any) {
  if (isObject(value) && isString(value.bind)) return true;
  if (value && value.isAccessorChain) return true;
  return value instanceof Binding;
}
