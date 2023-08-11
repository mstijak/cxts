import { Binding } from "./Binding";
import { isArray } from "../util/isArray";
import { isDefined } from "../util/isDefined";
import { StoreRef } from "./StoreRef";
import { isObject } from "../util/isObject";
import { isFunction } from "../util/isFunction";
import { AccessorChain, DataRecord } from "../core";
import { Ref } from "./Ref";

declare type Path = string | Binding;

export interface ViewConfig {
  store?: View;

  /* When set, the root data object of the parent store will be preserved (no virtual properties will be added), i.e. $record. */
  immutable?: boolean;

  /* When set, instructs the child views not to modify its data object (same effect as setting immutable on child stores). */
  sealed?: boolean;
}

export interface ViewMethods<D = any> {
  getData(): D;

  init(path: Path, value: any): boolean;
  init<V>(path: AccessorChain<V>, value: V | any): boolean;

  set(path: Path, value: any): boolean;
  set(changes: DataRecord): boolean;
  set<V>(path: AccessorChain<V>, value: V | any): boolean;

  get(path: Path): any;
  get(paths: Path[]): any[];
  get(...paths: Path[]): any[];
  get<V>(path: AccessorChain<V>): V;

  /**
   * Removes data from the Store.
   * @param paths - One or more paths to be deleted.
   * @return {boolean}
   */
  delete(path: Path): boolean;
  delete(paths: Path[]): boolean;
  delete(...paths: Path[]): boolean;
  delete<V>(path: AccessorChain<V>): boolean;

  toggle(path: Path): boolean;

  update(updateFn: (currentValue: D, ...args) => D, ...args): boolean;
  update(
    path: Path,
    updateFn: (currentValue: any, ...args) => any,
    ...args
  ): boolean;
  update<V>(
    path: AccessorChain<V>,
    updateFn: (currentValue: V, ...args) => V,
    ...args
  ): boolean;

  /**
   *  Mutates the content of the store using Immer
   */
  mutate(updateFn: (currentValue: D, ...args) => D, ...args): boolean;
  mutate(
    path: Path,
    updateFn: (currentValue: any, ...args) => any,
    ...args
  ): boolean;
  mutate<V>(
    path: AccessorChain<V>,
    updateFn: (currentValue: V, ...args) => V,
    ...args
  ): boolean;

  ref<T = any>(path: string, defaultValue?: T): Ref<T>;
}

export class View<D = any> implements ViewMethods<D> {
  cache: { version: number };
  meta: { version: number };
  store?: View;
  sealed?: boolean;

  constructor(config: ViewConfig) {
    Object.assign(this, config);
    this.cache = {
      version: -1,
    };
    if (this.store) this.setStore(this.store);
  }

  getData(): D {
    throw new Error("abstract method");
  }

  init(path, value) {
    if (typeof path == "object" && path != null) {
      let changed = false;
      for (let key in path)
        if (
          path.hasOwnProperty(key) &&
          this.get(key) === undefined &&
          this.setItem(key, path[key])
        )
          changed = true;
      return changed;
    }
    let binding = Binding.get(path);
    if (this.get(binding.path) === undefined)
      return this.setItem(binding.path, value);
    return false;
  }

  set(path, value) {
    if (isObject(path)) {
      let changed = false;
      for (let key in path)
        if (path.hasOwnProperty(key) && this.setItem(key, path[key]))
          changed = true;
      return changed;
    }
    let binding = Binding.get(path);
    return this.setItem(binding.path, value);
  }

  copy(from, to) {
    let value = this.get(from);
    this.set(to, value);
  }

  move(from, to) {
    this.batch(() => {
      this.copy(from, to);
      this.delete(from);
    });
  }

  //protected
  setItem(path, value) {
    if (this.store) return this.store.setItem(path, value);
    throw new Error("abstract method");
  }

  delete(path) {
    if (arguments.length > 1) path = Array.from(arguments);
    if (isArray(path)) return path.map((arg) => this.delete(arg)).some(Boolean);

    let binding = Binding.get(path);
    return this.deleteItem(binding.path);
  }

  //protected
  deleteItem(path) {
    if (this.store) return this.store.deleteItem(path);

    throw new Error("abstract method");
  }

  clear() {
    if (this.store) return this.store.clear();

    throw new Error("abstract method");
  }

  get(path): any {
    let storeData = this.getData();

    if (arguments.length > 1) path = Array.from(arguments);

    if (isArray(path))
      return path.map((arg) => Binding.get(arg).value(storeData));

    return Binding.get(path).value(storeData);
  }

  toggle(path) {
    return this.set(path, !this.get(path));
  }

  update(path, updateFn, ...args) {
    if (arguments.length == 1 && isFunction(path))
      return this.load(path.apply(null, [this.getData(), updateFn, ...args]));
    return this.set(path, updateFn.apply(null, [this.get(path), ...args]));
  }

  batch(callback) {
    let dirty = this.silently(callback);
    if (dirty) this.notify();
    return dirty;
  }

  silently(callback) {
    if (this.store) return this.store.silently(callback);

    throw new Error("abstract method");
  }

  notify(path?: string) {
    this.doNotify(path);
  }

  doNotify(path) {
    if (this.store) return this.store.notify(path);

    throw new Error("abstract method");
  }

  subscribe(callback) {
    if (this.store) return this.store.subscribe(callback);

    throw new Error("abstract method");
  }

  load(data) {
    return this.batch((store) => {
      for (let key in data) store.set(key, data[key]);
    });
  }

  dispatch(action) {
    if (this.store) return this.store.dispatch(action);

    throw new Error("The underlying store doesn't support dispatch.");
  }

  getMeta() {
    return this.meta;
  }

  setStore(store) {
    this.store = store;
    this.meta = store.getMeta();
  }

  ref(path, defaultValue) {
    if (isDefined(defaultValue)) this.init(path, defaultValue);
    return StoreRef.create({
      store: this,
      path,
    });
  }

  getMethods() {
    return {
      getData: this.getData.bind(this),
      set: this.set.bind(this),
      get: this.get.bind(this),
      update: this.update.bind(this),
      delete: this.delete.bind(this),
      toggle: this.toggle.bind(this),
      init: this.init.bind(this),
      ref: this.ref.bind(this),
      mutate: this.ref.bind(this),
    };
  }
}

View.prototype.sealed = false; //indicate that data should be copied before virtual items are added

//Immer integration point
View.prototype.mutate = function () {
  throw new Error(
    "Mutate requires Immer. Please install 'immer' and 'cx-immer' packages and enable store mutation by calling enableImmerMutate()."
  );
};
