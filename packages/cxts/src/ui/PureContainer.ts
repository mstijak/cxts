import { Container } from "./Container";

export class PureContainer extends Container {
  isPureContainer: boolean;
}

PureContainer.prototype.isPureContainer = true;

PureContainer.alias("pure-container", PureContainer);
