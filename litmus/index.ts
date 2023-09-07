//import "cxts/src/jsx";
import { Widget, startAppLoop, History, startHotAppLoop } from "cxts/src/ui";
import { Timing, Debug } from "cxts/src/util";
import { Store } from "cxts/src/data";

import Demo from "./features/test";

let store = (window.store = new Store());

Widget.resetCounter();
//Widget.optimizePrepare = false;
//Widget.prototype.memoize = false;
//Timing.enable('vdom-render');
Timing.enable("app-loop");
Debug.enable("app-data");

History.connect(store, "url");

startHotAppLoop(module, document.getElementById("app"), store, Demo);
