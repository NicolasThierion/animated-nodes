import { defaultsDeep } from 'lodash';
import { DisjointSet } from './disjoint-set';
import { GEdge } from './edge';
import { AnimatedNodesConfig } from './graph-config';
import { AnimatedNodesRenderer } from './graph-renderer';
import { GNode, GNodeInit } from './node';

export class Graph {
  // Configuration
  config: AnimatedNodesConfig;
  // State
  protected relWidth: number = NaN;
  protected relHeight: number = NaN;
  protected frameNumber: number = NaN;
  protected nodes: GNode[] = [];
  protected edges: GEdge[] = [];

  constructor(params: Partial<AnimatedNodesConfig>) {
    this.config = defaultsDeep({}, params, AnimatedNodesRenderer.DEFAULTS);

    this.frameNumber = 0;
  }

  public setDimensions(width: number, height: number): Graph {
    const max = Math.max(width, height);
    this.relWidth = width / max;
    this.relHeight = height / max;
    return this;
  }

  public stepFrame(): void {
    this.updateNodes(this.config.nodes);
    this.updateEdges(this.config.edges);
    this.frameNumber++;
  }

  protected createNode(node: GNodeInit) {
    return new GNode(node);
  }

  protected createEdge(node1: GNode, node2: GNode) {
    return new GEdge(node1, node2);
  }

  protected removeNode(node: GNode): void {}

  protected removeEdge(edge: GEdge): void {}

  // Updates, adds, and remove nodes according to the animation rules.
  private updateNodes(nodesConfig: AnimatedNodesConfig['nodes']): void {
    // Update each node's position, velocity, opacity. Remove fully transparent nodes.
    let newNodes: GNode[] = [];
    let curIdealNumNodes = Math.min(
      Math.floor(this.frameNumber / 3),
      this.config.nodes.amount
    );

    for (let node of this.nodes) {
      // Move based on velocity
      node.posX += node.velX * nodesConfig.speed;
      node.posY += node.velY * nodesConfig.speed;
      // Randomly perturb velocity, with damping
      node.velX = node.velX * 0.99 + (Math.random() - 0.5) * 0.3;
      node.velY = node.velY * 0.99 + (Math.random() - 0.5) * 0.3;

      // Fade out nodes near the borders of the rectangle, or exceeding the target number of nodes
      const insideness = Math.min(
        node.posX,
        this.relWidth - node.posX,
        node.posY,
        this.relHeight - node.posY
      );
      node.fade(
        newNodes.length < curIdealNumNodes &&
          insideness > this.config.borderFade
          ? nodesConfig.fadeInPerFrame
          : nodesConfig.fadeOutPerFrame
      );
      // Only keep visible nodes
      if (node.opacity > 0) {
        newNodes.push(node);
      } else {
        this.removeNode(node);
      }
    }

    // Add new nodes to fade in
    while (newNodes.length < curIdealNumNodes) {
      newNodes.push(
        this.createNode({
          posX: Math.random() * this.relWidth,
          posY: Math.random() * this.relHeight,
          radius: nodesConfig.init().size,
          velX: 0.0,
          velY: 0.0,
        })
      ); // Velocity
    }

    // Spread out nodes a bit
    this.nodes = newNodes;
    this.doForceField();
  }

  // Updates the position of each node in place, based on their existing
  // positions. Doesn't change velocity, opacity, edges, or anything else.
  private doForceField(): void {
    // For aesthetics, we perturb positions instead of velocities
    for (let i = 0; i < this.nodes.length; i++) {
      let a: GNode = this.nodes[i];
      a.dPosX = 0;
      a.dPosY = 0;
      for (let j = 0; j < i; j++) {
        let b: GNode = this.nodes[j];
        let dx: number = a.posX - b.posX;
        let dy: number = a.posY - b.posY;
        const distSqr: number = dx * dx + dy * dy;
        // Notes: The factor 1/sqrt(distSqr) is to make (dx, dy) into a unit vector.
        // 1/distSqr is the inverse square law, with a smoothing constant added to prevent singularity.
        const factor: number =
          this.config.nodes.repulsion /
          (Math.sqrt(distSqr) * (distSqr + 0.00001));
        dx *= factor;
        dy *= factor;
        a.dPosX += dx;
        a.dPosY += dy;
        b.dPosX -= dx;
        b.dPosY -= dy;
      }
    }
    for (let node of this.nodes) {
      node.posX += node.dPosX;
      node.posY += node.dPosY;
    }
  }

  // Updates, adds, and remove edges according to the animation rules.
  private updateEdges(edgesConfig: AnimatedNodesConfig['edges']): void {
    // Calculate array of spanning tree edges, then add some extra low-weight edges
    let allEdges: Array<[number, number, number]> = this.calcAllEdgeWeights();
    const idealNumEdges = Math.round(
      (this.nodes.length - 1) * (1 + this.config.edges.extraEdgeProportion)
    );
    let idealEdges: GEdge[] = this.calcSpanningTree(allEdges);
    for (const [_, i, j] of allEdges) {
      if (idealEdges.length >= idealNumEdges) break;
      let edge = this.createEdge(this.nodes[i], this.nodes[j]); // Convert data formats
      if (!Graph.containsEdge(idealEdges, edge)) idealEdges.push(edge);
    }

    // Classify each current edge, checking whether it is in the ideal set; prune faded edges
    let newEdges: GEdge[] = [];
    for (let edge of this.edges) {
      edge.fade(
        Graph.containsEdge(idealEdges, edge)
          ? this.config.nodes.fadeInPerFrame
          : this.config.nodes.fadeOutPerFrame
      );
      if (Math.min(edge.opacity, edge.nodeA.opacity, edge.nodeB.opacity) > 0) {
        newEdges.push(edge);
      } else {
        this.removeEdge(edge);
      }
    }

    // If there's room for new edges, add some missing spanning tree edges (higher priority), then extra edges
    for (const edge of idealEdges) {
      if (newEdges.length >= idealNumEdges) break;
      if (!Graph.containsEdge(newEdges, edge)) newEdges.push(edge);
    }
    this.edges = newEdges;
  }

  // Returns a sorted array of edges with weights, for all unique edge pairs. Pure function, no side effects.
  private calcAllEdgeWeights(): Array<[number, number, number]> {
    // Each entry has the form [weight,nodeAIndex,nodeBIndex], where nodeAIndex < nodeBIndex
    let result: Array<[number, number, number]> = [];
    for (let i = 0; i < this.nodes.length; i++) {
      // Calculate all n * (n - 1) / 2 edges
      const a: GNode = this.nodes[i];
      for (let j = 0; j < i; j++) {
        const b: GNode = this.nodes[j];
        let weight: number = Math.hypot(a.posX - b.posX, a.posY - b.posY); // Euclidean distance
        weight /= Math.pow(a.radius * b.radius, this.config.radiiWeightPower); // Give discount based on node radii
        result.push([weight, i, j]);
      }
    }
    return result.sort((a, b) => a[0] - b[0]); // Sort by ascending weight
  }

  // Returns a new array of edge objects that is a minimal spanning tree on the given set
  // of nodes, with edges in ascending order of weight. Pure function, no side effects.
  private calcSpanningTree(allEdges: Array<[number, number, number]>): GEdge[] {
    // Kruskal's MST algorithm
    let result: GEdge[] = [];
    let ds = new DisjointSet(this.nodes.length);
    for (const [_, i, j] of allEdges) {
      if (ds.mergeSets(i, j)) {
        result.push(this.createEdge(this.nodes[i], this.nodes[j])); // Convert data formats
        if (result.length >= this.nodes.length - 1) break;
      }
    }
    return result;
  }

  // Tests whether the given array of edge objects contains an edge with
  // the given endpoints (undirected). Pure function, no side effects.
  private static containsEdge(edges: GEdge[], edge: GEdge): boolean {
    for (const e of edges) {
      if (
        (e.nodeA == edge.nodeA && e.nodeB == edge.nodeB) ||
        (e.nodeA == edge.nodeB && e.nodeB == edge.nodeA)
      )
        return true;
    }
    return false;
  }
}
