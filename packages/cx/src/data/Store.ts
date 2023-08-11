import { ViewConfig } from "./View";
import { Binding } from "./Binding";
import { SubscribableView } from "./SubscribableView";

export interface StoreConfig extends ViewConfig {
  data?: any;
}

export class Store extends SubscribableView {
  data: any;

  constructor(config: StoreConfig = {}) {
    super(config);
    this.data = config.data ?? {};
    this.meta = {
      version: 0,
    };
  }

  getData() {
    return this.data;
  }

  setItem(path, value) {
    let next = Binding.get(path).set(this.data, value);
    if (next != this.data) {
      this.data = next;
      this.meta.version++;
      this.notify(path);
      return true;
    }
    return false;
  }

  deleteItem(path) {
    let next = Binding.get(path).delete(this.data);
    if (next != this.data) {
      this.data = next;
      this.meta.version++;
      this.notify(path);
      return true;
    }
    return false;
  }

  clear() {
    this.data = {};
    this.meta.version++;
    this.notify();
  }
}

Store.prototype.async = false;
