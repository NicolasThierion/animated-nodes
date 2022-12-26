import { setAttributes } from '../graph-utils';
import { GNode } from '../node';
import { SvgDrawable, SvgContext } from './svg-context';
import { GEdge } from '../edge';

export class SvgEdge extends GEdge implements SvgDrawable {
  public el?: Element;

  constructor(nodeA: GNode, nodeB: GNode, public svgContext: SvgContext) {
    super(nodeA, nodeB);
  }

  dispose() {
    if (this.el) {
      this.svgContext.g.removeChild(this.el);
    }
    return this;
  }

  draw() {
    if (!this.el) {
      this.el = document.createElementNS(
        this.svgContext.svg.namespaceURI,
        'line'
      );

      this.svgContext.g.appendChild(this.el);
    }
    const a: GNode = this.nodeA;
    const b: GNode = this.nodeB;
    let dx: number = a.posX - b.posX;
    let dy: number = a.posY - b.posY;
    const mag: number = Math.hypot(dx, dy);
    if (mag > a.radius + b.radius) {
      // Draw edge only if circles don't intersect
      dx /= mag; // Make (dx, dy) a unit vector, pointing from B to A
      dy /= mag;
      const opacity: number = Math.min(
        Math.min(a.opacity, b.opacity),
        this.opacity
      );

      this.svgContext.g.appendChild(
        setAttributes(this.el, {
          // Shorten the edge so that it only touches the circumference of each circle
          x1: a.posX - dx * a.radius,
          y1: a.posY - dy * a.radius,
          x2: b.posX + dx * b.radius,
          y2: b.posY + dy * b.radius,
          stroke: 'rgba(129,139,197,' + opacity.toFixed(3) + ')',
        })
      );
    }
  }
}
