import { Instance } from "./Instance";
import { RenderingContext } from "./RenderingContext";
import { Component } from "../util/Component";
import { CSSHelper } from "./CSSHelper";
import "./CSS";
import { StructuredSelector } from "../data/StructuredSelector";
import { parseStyle } from "../util/parseStyle";
import { isString } from "../util/isString";
import { isDefined } from "../util/isDefined";
import { isArray } from "../util/isArray";
import { Console } from "../util/Console";

import { VDOM as vdom } from "./VDOM";
import { CSSTool } from "./CSS";
import { BooleanProp, ClassProp, StyleProp } from "../core";
import { Controller } from "./Controller";

export const VDOM = vdom;

let widgetId = 100;

export interface WidgetConfig {
  styles?: StyleProp;
  style?: StyleProp;
  visible?: BooleanProp;
  if?: BooleanProp;
  styled?: boolean;
  outerLayout?: unknown;
  contentFor?: string;
  putInto?: string;
  isContent?: boolean;
  class?: ClassProp;
  className?: ClassProp;
  vdomKey?: string;
}

export abstract class Widget extends Component {
  widgetId: number;
  jsxSpread: object[];
  jsxAttributes: string[];

  styles?: StyleProp;
  style?: StyleProp;
  visible?: BooleanProp;
  memoize: boolean;
  if?: BooleanProp;
  styled?: boolean;
  outerLayout?: Widget;
  contentFor?: string;
  putInto?: string;
  isContent?: boolean;
  CSS: CSSTool;
  class?: ClassProp;
  className?: ClassProp;
  initialized: boolean;
  components?: Record<string, Widget>;
  helpers?: Record<string, Widget>;
  version?: number;
  selector: StructuredSelector;
  baseClass: string;
  nameMap: Record<string, string>;
  vdomKey?: string;
  controller: Controller;
  readonly isPureContainer: boolean;

  constructor(config: WidgetConfig) {
    super(config);
    this.widgetId = widgetId++;

    if (isArray(this.jsxSpread)) {
      if (!this.jsxAttributes) this.jsxAttributes = [];

      this.jsxSpread.forEach((spread) => {
        for (var key in spread) {
          this[key] = spread[key];
          this.jsxAttributes.push(key);
        }
      });
    }
  }

  init(context: RenderingContext) {
    if (this.styles) this.style = this.styles;

    if (this.styled) this.style = parseStyle(this.style);
    else if (this.style) {
      Console.warn(
        "Components that allow use of the style attribute should set styled = true on their prototype. This will be an error in future versions.",
      );
      this.style = parseStyle(this.style);
      this.styled = true;
    }

    if (typeof this.if !== "undefined") this.visible = this.if;

    this.declareData();

    if (this.outerLayout) {
      if (isArray(this.outerLayout))
        throw new Error("Only single element outer layout is supported.");
      //TODO: better handle the case when outer layout is an array. How to get around circular dependency to PureContainer
      this.outerLayout = Widget.create(this.outerLayout);
    }

    if (this.contentFor) this.putInto = this.contentFor;

    if (this.putInto) this.isContent = true;

    if (isString(this.CSS)) this.CSS = CSSHelper.get(this.CSS);

    this.initHelpers();
    this.initComponents();

    this.initialized = true;
  }

  initComponents(...args) {
    if (args.length > 0) {
      this.components = Object.assign({}, ...args);
      for (var k in this.components)
        if (!this.components[k]) delete this.components[k];
    }
  }

  initHelpers(...args) {
    if (arguments.length > 0) {
      this.helpers = Object.assign({}, ...args);
    }
  }

  declareData(...args) {
    let options: any = {};

    if (this.styled)
      options.class = options.className = options.style = { structured: true };

    var props = {
      visible: undefined,
      mod: {
        structured: true,
      },
      ...options,
    };

    Object.assign(props, ...args);
    this.selector = new StructuredSelector({ props: props, values: this });
    this.nameMap = this.selector.nameMap;
  }

  prepareCSS(context, { data }) {
    data.classNames = this.CSS.expand(
      this.CSS.block(this.baseClass, data.mod, data.stateMods),
      data.class,
      data.className,
    );
    data.style = parseStyle(data.style);
  }

  prepareData(context: RenderingContext, instance: Instance) {
    if (this.styled) this.prepareCSS(context, instance);
  }

  initInstance(context: RenderingContext, instance: Instance) {
    if (this.onInit) this.onInit(context, instance);
  }

  initState(context: RenderingContext, instance: Instance) {}

  checkVisible(context: RenderingContext, instance: Instance, data?: any) {
    return data.visible;
  }

  explore(context: RenderingContext, instance: Instance, data?: any) {
    if (this.components) instance.components = {};
    for (let cmp in this.components) {
      let ins = instance.getChild(
        context,
        this.components[cmp],
        "cmp-" + cmp,
        instance.store,
      );
      if (ins.scheduleExploreIfVisible(context)) instance.components[cmp] = ins;
    }
  }

  prepare?: (context: RenderingContext, instance: Instance) => void;
  prepareCleanup?: (context: RenderingContext, instance: Instance) => void;
  exploreCleanup?: (context: RenderingContext, instance: Instance) => void;
  cleanup?: (context: RenderingContext, instance: Instance) => void;

  onInit?: (context: RenderingContext, instance: Instance) => void;
  onExplore?: (context: RenderingContext, instance: Instance) => void;
  onDestroy?: (instance: Instance) => void;

  abstract render(
    context: RenderingContext,
    instance: Instance,
    key: string,
  ): any;

  update() {
    this.version = (this.version || 0) + 1;
  }

  static resetCounter() {
    widgetId = 100;
  }

  static optimizePrepare = true;
}

Widget.prototype.visible = true;
Widget.prototype.memoize = true; //cache rendered content and use it if possible
Widget.prototype.CSS = "cx" as any; //hacked, as this gets replaced later
Widget.prototype.styled = false;

Widget.namespace = "ui.";
Widget.factory = (type, config, more) => {
  throw new Error(`Invalid widget type: ${type}.`);
};

export function contentAppend(result: any[], w: any, prependSpace?: boolean) {
  if (w == null || w === false) return false;
  if (isArray(w)) w.forEach((c) => contentAppend(result, c));
  else if (isDefined(w.content) && !w.atomic)
    return contentAppend(result, w.content);
  else {
    if (prependSpace) result.push(" ");
    result.push(w);
  }
  return true;
}

export function getContentArray(x) {
  let result = [];
  contentAppend(result, x);
  return result;
}

export function getContent(x) {
  let result = getContentArray(x);
  if (result.length == 0) return null;
  if (result.length == 1) return result[0];
  return result;
}
