export interface SvgContext {
  svg: SVGElement;
  g: Element;
  defs: Element;
}

export interface SvgDrawable {
  dispose(): void;
  draw(): void;
}
