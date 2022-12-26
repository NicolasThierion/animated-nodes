import { GNode } from './node';
import { GObject } from './object';

export class GEdge extends GObject {
  public constructor(public nodeA: GNode, public nodeB: GNode) {
    // A reference to the node object representing another side of the undirected edge (must be distinct from NodeA)
    super();
  }
}
