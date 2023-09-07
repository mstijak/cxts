import { VDOM } from "./../ui/VDOM";
import { FocusManager } from "../ui/FocusManager";
import { isTouchEvent } from "../util/isTouchEvent";

export function autoFocus(el: HTMLElement, component: VDOM.Component) {
  let data = component.props.data || component.props.instance.data;
  let autoFocusValue = el && data.autoFocus;
  if (
    autoFocusValue &&
    autoFocusValue != component.autoFocusValue &&
    !isTouchEvent()
  )
    FocusManager.focus(el);
  component.autoFocusValue = autoFocusValue;
}
