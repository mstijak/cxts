import { VDOM as vdom } from "cxts-react";

export interface VDOMImplementation {
  createElement(type, props, ...children);
  allowRenderOutputCaching?: boolean;

  DOM: {
    unstable_batchedUpdates?: (callback: () => void) => void;
    unmountComponentAtNode: (node: Element) => boolean;
    render: (element: any, node: Element) => void;
  };
}

export const VDOM: VDOMImplementation = vdom;
