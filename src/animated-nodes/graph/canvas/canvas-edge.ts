import { GEdge } from '../edge';
import { GNode } from '../node';
import { CanvasContext } from './canvas-context';

export class CanvasEdge extends GEdge {
  private init: ReturnType<CanvasContext['edges']>;
  constructor(node1: GNode, node2: GNode, private context: CanvasContext) {
    super(node1, node2);
    this.init = context.edges();
  }

  draw(): void {
    const { canvas, context2D } = this.context;

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

      context2D.save();
      context2D.globalAlpha = opacity;

      const max = Math.max(canvas.width, canvas.height);

      const [
        // Shorten the edge so that it only touches the circumference of each circle
        x1,
        y1,
        x2,
        y2,
        stroke,
      ] = [
        (a.posX - dx * a.radius) * max,
        (a.posY - dy * a.radius) * max,
        (b.posX + dx * b.radius) * max,
        (b.posY + dy * b.radius) * max,
        this.init.color,
      ];

      context2D.beginPath();
      context2D.moveTo(x1, y1);
      context2D.lineTo(x2, y2);
      context2D.lineWidth = this.init.size;
      context2D.strokeStyle = stroke;

      context2D.stroke();
      context2D.restore();
    }
  }

  dispose() {}
}
