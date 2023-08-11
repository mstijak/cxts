import "../packages/cx/src/jsx";
import { Widget, WidgetConfig } from "../packages/cx/src/ui/Widget";

interface XProps extends WidgetConfig {
  a: number;
}

class X extends Widget {
  constructor(props: XProps) {
    super(props);
  }
}

export default (
  <cx>
    <div className={{ bind: "x" }}>Test</div>
    <X a={1} />
  </cx>
);
