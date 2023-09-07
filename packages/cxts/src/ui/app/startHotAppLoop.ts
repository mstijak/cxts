import { startAppLoop } from "./startAppLoop";
import { Widget } from "../Widget";
import { View } from "../../data";
import { Instance } from "../Instance";

/**
   Starts the app loop with hot module reloading. Whenever the given module is updated, the app state is preserved.
 */
export function startHotAppLoop(
  appModule: any,
  parentDOMElement: Element,
  storeOrInstance: View | Instance,
  widget?: Widget,
  options?: any,
) {
  let store =
    storeOrInstance instanceof Instance
      ? storeOrInstance.store
      : storeOrInstance;

  let stop;
  //webpack (HMR)
  if (appModule.hot) {
    // accept itself
    appModule.hot.accept();

    // remember data on dispose
    appModule.hot.dispose(function (data) {
      data.state = store.getData();
      if (stop) stop();
    });

    //apply data on hot replace
    if (appModule.hot.data) store.load(appModule.hot.data.state);
  }

  Widget.resetCounter();

  //app loop
  return (stop = startAppLoop(parentDOMElement, store, widget, options));
}
