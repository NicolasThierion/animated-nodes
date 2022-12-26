/*---- Minor graph object classes ----*/

export class GObject {
  public opacity: number = 0.0;

  public fade(delta: number): void {
    this.opacity = Math.max(Math.min(this.opacity + delta, 1.0), 0.0);
  }
}
