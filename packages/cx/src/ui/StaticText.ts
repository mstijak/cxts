import { Widget } from "./Widget";

export class StaticText extends Widget {
  text: String;

  render() {
    return this.text;
  }
}
