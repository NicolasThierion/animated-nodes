import { GObject } from './object';

export type GNodeInit = Partial<GNode> & {
  posX: number;
  posY: number;
  radius: number;
};

export class GNode extends GObject {
  public dPosX: number = 0;
  public dPosY: number = 0;
  public posX: number; // Horizontal position in relative coordinates, typically in the range [0.0, relWidth], where relWidth <= 1.0
  public posY: number; // Vertical position in relative coordinates, typically in the range [0.0, relHeight], where relHeight <= 1.0
  public radius: number; // Radius of the node, a positive real number
  public velX: number; // Horizontal velocity in relative units (not pixels)
  public velY: number;

  public constructor(node: GNodeInit) {
    // Vertical velocity in relative units (not pixels)
    super();
    this.posX = node.posX;
    this.posY = node.posY;
    this.radius = node.radius;
    this.velX = node.velX ?? 0.0;
    this.velY = node.velY ?? 0.0;
  }
}
