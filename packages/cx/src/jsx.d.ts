import { Widget, WidgetConfig } from "./ui/Widget";
import { GlobalJSXIntrinsicElements } from "./react";
import { Prop } from "./core";

interface CxWidgetClass<Props extends WidgetConfig> {
  new (props: Props): Widget;
}

export type CxNode = string | Widget | CxWidgetClass<any>;

type CxJSMapped<T> = {
  [key in keyof T]: Prop<T[key]>;
};

type CxJSXIntrinsicElements = {
  [key in keyof GlobalJSXIntrinsicElements]: CxJSMapped<
    GlobalJSXIntrinsicElements[key]
  >;
};

declare global {
  namespace JSX {
    type IntrinsicElements = CxJSXIntrinsicElements & {
      cx: {
        children?: CxNode;
      };
    };
  }
}
