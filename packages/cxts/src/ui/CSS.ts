import { CSSHelper } from "./CSSHelper";
import { parseStyle } from "../util/parseStyle";
import { isArray } from "../util/isArray";

function push(list, item) {
  if (!item) return list;
  if (!list) list = [];
  list.push(item);
  return list;
}

function pushMore(list, itemArray) {
  if (!itemArray || itemArray.length == 0) return list;
  if (!list) list = [];
  list.push.apply(list, itemArray);
  return list;
}

function pushMap(list, itemArray, mapF) {
  return itemArray ? pushMore(list, itemArray.map(mapF)) : list;
}

function join(list): string {
  return list ? list.join(" ") : null;
}

export interface CSSTool {
  resolve(...args): string[];
  expand(...args): string;
  block(baseClass, styleModifiers, stateModifiers): string;
  element(baseClass, elementClass, stateModifiers): string;
  state(stateModifiers): string;
}

export class CSS {
  static resolve(...args) {
    let list, type, arg, i, key;

    for (i = 0; i < args.length; i++) {
      arg = args[i];
      if (arg) {
        type = typeof arg;
        if (type == "string") list = push(list, arg);
        else if (type == "object") {
          if (isArray(arg)) list = pushMore(list, this.resolve(...arg));
          else for (key in arg) if (arg[key]) list = push(list, key);
        }
      }
    }
    return list;
  }

  static block(baseClass, styleModifiers, stateModifiers) {
    let list;
    if (baseClass) list = push(list, this.classPrefix + "b-" + baseClass);
    list = pushMap(
      list,
      this.resolve(styleModifiers),
      (m) => this.classPrefix + "m-" + m,
    );
    list = pushMap(
      list,
      this.resolve(stateModifiers),
      (m) => this.classPrefix + "s-" + m,
    );
    return join(list);
  }

  static element(baseClass, elementClass, stateModifiers) {
    let list;
    if (baseClass && elementClass)
      list = push(
        list,
        this.classPrefix + "e-" + baseClass + "-" + elementClass,
      );
    list = pushMap(
      list,
      this.resolve(stateModifiers),
      (m) => this.classPrefix + "s-" + m,
    );
    return join(list);
  }

  static state(stateModifiers) {
    return join(
      pushMap(
        null,
        this.resolve(stateModifiers),
        (m) => this.classPrefix + "s-" + m,
      ),
    );
  }

  static mod(mods) {
    return join(
      pushMap(null, this.resolve(mods), (m) => this.classPrefix + "m-" + m),
    );
  }

  static expand(...args) {
    return join(this.resolve(...args));
  }

  static parseStyle(str) {
    return parseStyle(str);
  }

  static classPrefix = "cx";
}

CSSHelper.alias("cx", CSS);
