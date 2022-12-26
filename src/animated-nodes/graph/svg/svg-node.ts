import { setAttributes } from '../graph-utils';
import { SvgDrawable, SvgContext } from './svg-context';
import { GNode, GNodeInit } from '../node';

let globalId = 0;
export class SvgNode extends GNode implements SvgDrawable {
  private el: Element;
  private imgCircleEl?: Element;
  private patternEl?: Element;

  private imgId?: string;
  private imgEl?: Element;
  constructor(init: GNodeInit, public svgContext: SvgContext) {
    super(init);

    const { svg, g, defs } = svgContext;
    this.el = document.createElementNS(svg.namespaceURI, 'circle');

    g.appendChild(this.el);
    if (this.img) {
      this.imgId = `node-bg-${globalId++}`;

      this.imgCircleEl = document.createElementNS(svg.namespaceURI, 'circle');
      this.patternEl = document.createElementNS(svg.namespaceURI, 'pattern');
      this.imgEl = document.createElementNS(svg.namespaceURI, 'image');

      g.appendChild(this.imgCircleEl);
      defs.appendChild(this.patternEl);
      this.patternEl.appendChild(this.imgEl);

      setAttributes(this.patternEl, {
        id: this.imgId,
        patternUnits: 'userSpaceOnUse',
        width: 1,
        height: 1,
      });

      setAttributes(this.imgEl, {
        width: this.radius * 1.5,
        height: this.radius * 1.5,
        href: this.img,
      });

      setAttributes(this.imgCircleEl, {
        fill: `url(#${this.imgId})`,
      });
    }
    setAttributes(this.el, {
      cx: this.posX,
      cy: this.posY,
      r: this.radius,
      opacity: +this.opacity.toFixed(3),
      fill: this.fill,
    });
  }

  dispose() {
    // this.svgContext.g.removeChild(this.el);
    if (this.imgCircleEl) {
      this.svgContext.g.removeChild(this.imgCircleEl);
      this.svgContext.defs.removeChild(this.patternEl!);
    }
  }

  draw() {
    setAttributes(this.el, {
      cx: this.posX,
      cy: this.posY,
      r: this.radius,
      opacity: this.opacity,
    });
    if (this.imgCircleEl) {
      setAttributes(this.imgCircleEl, {
        cx: this.posX,
        cy: this.posY,
        r: this.radius,
        opacity: this.opacity,
        // fill: `url(#${this.imgId})`,
      });

      setAttributes(this.imgEl!, {
        x: this.posX - this.radius * 0.75,
        y: this.posY - this.radius * 0.75,
      });
    }
  }
}
