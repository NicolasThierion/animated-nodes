import { AnimatedNodesConfig } from '../graph-config';

export interface CanvasContext {
  gradient: AnimatedNodesConfig['gradient'];
  background: AnimatedNodesConfig['background'];
  canvas: HTMLCanvasElement;
  context2D: CanvasRenderingContext2D;
  nodes: AnimatedNodesConfig['nodes']['init'];
  edges: AnimatedNodesConfig['edges']['init'];
}
