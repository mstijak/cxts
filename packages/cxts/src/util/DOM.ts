import { HtmlElement } from "../widgets";
import { isNumber } from "./isNumber";

export function findFirst(
  el: Node,
  condition: (el: Node) => boolean,
): Node | null {
  if (condition(el)) return el;

  var children = el.childNodes;
  if (children)
    for (var i = 0; i < children.length; i++) {
      var child = findFirst(children[i], condition);
      if (child) return child;
    }
  return null;
}

export function findFirstChild(
  el: Node,
  condition: (el: Node) => boolean,
): Node | null {
  var children = el.childNodes;
  if (children)
    for (var i = 0; i < children.length; i++) {
      var child = findFirst(children[i], condition);
      if (child) return child;
    }
  return null;
}

export function closest(
  el: Node,
  condition: (el: Node) => boolean,
): Node | null {
  while (el) {
    if (condition(el)) return el;
    el = el.parentNode;
  }
  return null;
}

export function closestParent(
  el: Node,
  condition: (el: Node) => boolean,
): Node | null {
  return el && closest(el.parentNode, condition);
}

export function isFocused(el: Node) {
  return document.activeElement == el;
}

export function isFocusedDeep(el: Node) {
  return (
    document.activeElement == el ||
    (document.activeElement && el.contains(document.activeElement))
  );
}

const focusableWithoutTabIndex = ["INPUT", "SELECT", "TEXTAREA", "A", "BUTTON"];

export function isFocusable(el: Element) {
  if (!el) return false;
  let tabIndex = el.getAttribute("tabindex");
  if (tabIndex != null && Number(tabIndex) >= 0) return true;

  return (
    focusableWithoutTabIndex.indexOf(el.tagName) != -1 &&
    !el.hasAttribute("disabled")
  );
}

export function getFocusedElement(): Element {
  return document.activeElement;
}

export function isDescendant(el: Node, descEl: Node): boolean {
  return el.contains(descEl);
}

export function isSelfOrDescendant(el: Node, descEl: Node): boolean {
  return el == descEl || el.contains(descEl);
}
