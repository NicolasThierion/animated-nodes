export function setAttributes(el: Element, attribs: any): Element {
  for (const key in attribs) {
    if (attribs[key] !== undefined) {
      el.setAttribute(key, attribs[key].toString());
    }
  }
  return el;
}
