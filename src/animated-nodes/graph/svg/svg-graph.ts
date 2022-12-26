import { SvgEdge } from './svg-edge';
import { Graph } from '../graph';
import { AnimatedNodesConfig } from '../graph-config';
import { GNode, GNodeInit } from '../node';
import { SvgNode } from './svg-node';
import { SvgContext } from './svg-context';

export class SvgGraph extends Graph {
  svgContext: SvgContext;
  protected nodes: SvgNode[] = [];
  protected edges: SvgEdge[] = [];

  constructor(params: Partial<AnimatedNodesConfig>, svg: SVGElement) {
    super(params);
    this.svgContext = {
      svg,
      g: svg.querySelector('g') as Element,
      defs: svg.querySelector('defs') as Element,
    };
  }
  public setOutput(): SvgGraph {
    let br = this.svgContext.svg.getBoundingClientRect();
    this.setDimensions(
      br.width
      br.height
    );

    this.svgContext.svg.setAttribute(
      'viewBox',
      `0 0 ${this.relWidth} ${this.relHeight}`
    );
    this.svgContext.svg.setAttribute('width', this.relWidth.toString());
    this.svgContext.svg.setAttribute('height', this.relHeight.toString());
    return this;
  }

  public redrawOutput(): void {
    if (this.svgContext.svg === null) throw 'Invalid state';

    // Draw every node
    this.nodes.forEach((n) => n.draw());
    // Draw every edge
    this.edges.forEach((n) => n.draw());
  }

  protected createNode(node: GNodeInit) {
    return new SvgNode(node, this.svgContext);
  }

  protected createEdge(node1: GNode, node2: GNode) {
    return new SvgEdge(node1, node2, this.svgContext);
  }

  protected removeNode(node: SvgNode): void {
    node.dispose();
  }

  protected removeEdge(edge: SvgEdge): void {
    edge.dispose();
  }
}
