import { View } from "../../data/View";
import { Instance } from "../Instance";
import { RenderingContext } from "../RenderingContext";
import { Widget } from "../Widget";

export function exploreChildren(
  context: RenderingContext,
  instance: Instance,
  children: Widget[],
  previousResult: Instance[],
  key?: string,
  store?: View,
  beforeCallback?: () => void,
  afterCallback?: () => void
) {
  let newChildren = previousResult || [];
  let oldChildren = previousResult || newChildren;
  let identical = previousResult ? 0 : -1;

  // if (children.length)
  //    context.exploreStack.hop();

  for (let c = 0; c < children.length; c++) {
    let cell = instance.getChild(context, children[c], key, store);

    // if (beforeCallback)
    //    beforeCallback(cell);

    if (cell.checkVisible(context)) {
      if (identical >= 0) {
        if (cell == oldChildren[identical]) identical++;
        else {
          newChildren = newChildren.slice(0, identical);
          identical = -1;
          newChildren.push(cell);
        }
      } else newChildren.push(cell);

      context.exploreStack.push(cell);
      if (cell.needsExploreCleanup) context.exploreStack.push(cell);
    }
  }

  if (identical >= 0 && identical != newChildren.length)
    newChildren = newChildren.slice(0, identical);

  return newChildren;
}
