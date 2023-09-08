//import "cxts/src/jsx";
import { Store } from "cxts/src/data";
import { History, Widget, startHotAppLoop } from "cxts/src/ui";
import { Debug, Timing } from "cxts/src/util";

import Demo from "./features/test";

let store = (window["store"] = new Store());

Widget.resetCounter();
//Widget.optimizePrepare = false;
//Widget.prototype.memoize = false;
//Timing.enable('vdom-render');
Timing.enable("app-loop");
Debug.enable("app-data");

History.connect(store, "url");

startHotAppLoop(module, document.getElementById("app"), store, Demo);
