import { Widget, startAppLoop, History, startHotAppLoop } from "cxts/ui";
import { Timing, Debug } from "cxts/util";
import { Store } from "cxts/data";

import Demo from "./features/test.ts";

let store = (window.store = new Store());

Widget.resetCounter();
//Widget.optimizePrepare = false;
//Widget.prototype.memoize = false;
//Timing.enable('vdom-render');
Timing.enable("app-loop");
Debug.enable("app-data");

History.connect(store, "url");

startHotAppLoop(module, document.getElementById("app"), store, Demo);
