import { AccessorChain } from "../core";

const emptyFn = () => {};

export function createAccessorModelProxy<M>(chain = ""): AccessorChain<M> {
  let lastOp: string | null = null;

  const proxy = new Proxy(emptyFn, {
    get: (_, name) => {
      if (typeof name !== "string") return proxy;

      switch (name) {
        case "isAccessorChain":
          return true;

        case "toString":
        case "valueOf":
        case "nameOf":
          lastOp = name;
          return proxy;
      }

      let newChain = chain;
      if (newChain.length > 0) newChain += ".";
      newChain += name;
      return createAccessorModelProxy(newChain);
    },

    apply() {
      switch (lastOp) {
        case "nameOf":
          const lastDotIndex = chain.lastIndexOf(".");
          return lastDotIndex > 0 ? chain.substring(lastDotIndex + 1) : chain;

        default:
          return chain;
      }
    },
  });
  return proxy;
}

export function isAccessorChain(value) {
  return value != null && !!value.isAccessorChain;
}
