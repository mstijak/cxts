import { isAccessorChain } from "./createAccessorModelProxy";
import { Ref } from "./Ref";
import { View } from "./View";

export class StoreRef extends Ref {
  path: string;
  store: View;

  constructor(config) {
    super(config);
    if (isAccessorChain(this.path)) this.path = this.path.toString();
    this.set = (value) => this.store.set(this.path, value);
  }

  get() {
    return this.store.get(this.path);
  }

  init(value) {
    return this.store.init(this.path, value);
  }

  toggle() {
    return this.store.toggle(this.path);
  }

  delete() {
    return this.store.delete(this.path);
  }

  update(updateFn, ...args) {
    return this.store.update(this.path, updateFn, ...args);
  }

  //allows the function to be passed as a selector, e.g. to computable or addTrigger
  memoize() {
    return this.get;
  }

  ref(path) {
    return new StoreRef({
      path: `${this.path}.${path}`,
      store: this.store,
    });
  }

  as(config) {
    return StoreRef.create(config, {
      path: this.path,
      store: this.store,
      get: this.get,
      set: this.set,
    });
  }
}
