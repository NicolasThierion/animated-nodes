import { Graph } from '../graph';
import { AnimatedNodesConfig } from '../graph-config';
import { GNode, GNodeInit } from '../node';
import { CanvasContext } from './canvas-context';
import { CanvasEdge } from './canvas-edge';
import { CanvasNode } from './canvas-node';

export class CanvasGraph extends Graph {
  protected nodes: CanvasNode[] = [];
  protected edges: CanvasEdge[] = [];

  constructor(
    config: Partial<AnimatedNodesConfig>,
    private context: CanvasContext
  ) {
    super(config);
  }

  redrawOutput(): this {
    const { canvas, context2D } = this.context;

    // draw background
    context2D.clearRect(0, 0, canvas.width, canvas.height);
    context2D.fillStyle = this.context.background.color();
    context2D.fillRect(0, 0, canvas.width, canvas.height);

    // draw gradient
    this.drawGradient();

    // Draw every node
    this.nodes.forEach((n) => n.draw());
    // Draw every edge
    this.edges.forEach((n) => n.draw());
    return this;
  }
  drawGradient() {
    const { canvas, context2D } = this.context;

    const gradient = this.context.gradient;
    const [centerX1, centerY1, radius1] = gradient.innerCenter();
    const [centerX2, centerY2, radius2] = gradient.outerCenter();
    const max = Math.max(canvas.height, canvas.width);
    const grd = context2D.createRadialGradient(
      canvas.width * centerX1,
      canvas.height * centerY1,
      max * radius1,
      canvas.width * centerX2,
      canvas.height * centerY2,
      max * radius2
    );
    grd.addColorStop(0, this.context.gradient.color1());
    grd.addColorStop(1, this.context.gradient.color2());

    // Fill with gradient
    context2D.fillStyle = grd;
    context2D.fillRect(0, 0, canvas.width, canvas.height);
  }
  setOutput(): this {
    const { canvas } = this.context;
    // Make it visually fill the positioned parent
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    // ...then set the internal size to match
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    this.setDimensions(canvas.width, canvas.height);

    return this;
  }

  protected createNode(node: GNodeInit) {
    return new CanvasNode(node, this.context);
  }

  protected createEdge(node1: GNode, node2: GNode) {
    return new CanvasEdge(node1, node2, this.context);
  }

  protected removeNode(node: CanvasNode): void {
    node.dispose();
  }

  protected removeEdge(edge: CanvasEdge): void {
    edge.dispose();
  }
}
