import { Container } from "./Container";
import { Instance } from "./Instance";

export class PureContainer extends Container {
  isPureContainer: boolean;

  render(context: RenderingContext, instance: Instance, key: string) : any {
    return this.renderChildren(context, instance);
  }
}

PureContainer.prototype.isPureContainer = true;

PureContainer.alias("pure-container", PureContainer);
