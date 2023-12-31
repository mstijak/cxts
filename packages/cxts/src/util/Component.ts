import { isString } from "./isString";
import { isFunction } from "./isFunction";
import { isArray } from "./isArray";

const componentAlias = {};

export class Component {
  isComponent: boolean;

  static isComponentType = true;
  static namespace = "";
  static autoInit = false;

  constructor(config) {
    if (config && config.$props) {
      Object.assign(config, config.$props);
      delete config.$props;
    }
    Object.assign(this, config);
  }

  static alias(alias, type) {
    if (type) {
      type.prototype.componentAlias = alias;
      componentAlias[this.namespace + alias] = type;
    } //decorator usage
    else
      return (t) => {
        this.alias(alias, t);
        return t;
      };
  }

  static factory: (alias, config?, more?) => Component = (alias) => {
    throw new Error(`Unknown component alias ${alias}.`);
  };

  static create(typeAlias, config?, more?) {
    if (!typeAlias) return this.factory(typeAlias, config, more);

    if (typeAlias.isComponent) return typeAlias;

    if (isComponentFactory(typeAlias))
      return this.create(typeAlias.create(config));

    if (isArray(typeAlias))
      return typeAlias.map((c) => this.create(c, config, more));

    if (typeAlias.$type) return this.create(typeAlias.$type, typeAlias, config);

    if (typeAlias.type) return this.create(typeAlias.type, typeAlias, config);

    let cmpType, alias;

    if (typeAlias.isComponentType) cmpType = typeAlias;
    else if (isFunction(typeAlias)) {
      if (this.factory) return this.factory(typeAlias, config, more);
      throw new Error(`Unsupported component type ${typeAlias}.`);
    } else if (isString(typeAlias)) {
      alias = this.namespace + typeAlias;
      cmpType = componentAlias[alias];
      if (!cmpType) {
        if (typeAlias && this.factory)
          return this.factory(typeAlias, config, more);
        throw new Error(`Unknown component alias ${alias}.`);
      }
    } else if (typeof typeAlias == "object") {
      cmpType = typeAlias.type || typeAlias.$type;
      if (!cmpType) {
        cmpType = this;
        more = more ? Object.assign({}, config, more) : config;
        config = typeAlias;
      }
    }

    if (isArray(config))
      return config.map((cfg) => this.create(cmpType, cfg, more));

    let cfg = config;

    if (more) cfg = Object.assign({}, config, more);

    let cmp = new cmpType(cfg);
    if (cmpType.autoInit && cmp.init) cmp.init();
    return cmp;
  }
}

Component.prototype.isComponent = true;

export interface ComponentFactory {
  create(config?: any): Component;
}

export function createComponentFactory(
  factory,
  jsxDriver,
  meta,
): ComponentFactory {
  factory.$isComponentFactory = true;
  factory.$meta = meta;
  factory.create = jsxDriver;
  return factory;
}

export function isComponentFactory(factory: any): factory is ComponentFactory {
  return factory?.$isComponentFactory == true;
}
