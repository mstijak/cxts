import { StringProp } from "../core";
import { Widget } from "./Widget";

export class Text extends Widget {
  value: StringProp;
  tpl?: string;
  expr?: string;
  bind?: string;

  init() {
    if (!this.value && (this.tpl || this.expr || this.bind))
      this.value = {
        tpl: this.tpl,
        expr: this.expr,
        bind: this.bind,
      };
    super.init();
  }

  declareData(...args) {
    super.declareData(
      {
        value: undefined,
      },
      ...args
    );
  }

  render(context, { data }, key) {
    return data.value ?? "";
  }
}
