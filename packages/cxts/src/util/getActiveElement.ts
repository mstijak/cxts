export function getActiveElement(): Element {
  return document.activeElement ?? document.body;
}
