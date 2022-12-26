import { GNode, GNodeInit } from '../node';
import { CanvasContext } from './canvas-context';

export interface CanvasNodeInit extends GNodeInit {}
export class CanvasNode extends GNode {
  img?: HTMLImageElement = undefined;
  private init: ReturnType<CanvasContext['nodes']>;

  constructor(node: CanvasNodeInit, private context: CanvasContext) {
    super(node);
    this.init = this.context.nodes();

    const bgImg = this.init.background.img;
    if (bgImg) {
      const _img = new Image();
      const _this = this;
      _img.addEventListener(
        'load',
        function (e) {
          _this.img = this;
        },
        true
      );

      _img.src = bgImg;
    }
  }

  draw(): void {
    const { canvas, context2D } = this.context;
    const max = Math.max(canvas.width, canvas.height);
    const centerX = this.posX * max;
    const centerY = this.posY * max;

    const relativeRadius = this.radius * canvas.width * 0.8;
    const r = relativeRadius;
    context2D.save();
    context2D.globalAlpha = this.opacity;
    context2D.beginPath();
    // context2D.filter = 'blur(10px)';
    context2D.arc(centerX, centerY, r, 0, 2 * Math.PI, false);
    context2D.fillStyle = this.init.background.color;

    context2D.fill();

    if (this.img) {
      context2D.globalAlpha = this.opacity;

      context2D.drawImage(
        this.img,
        centerX - r / 1.5,
        centerY - r / 1.5,
        r * 1.36,
        r * 1.36
      );
    }

    if (this.init.text?.value) {
      const font = `${this.init.text.fontWeight ?? '500'} ${(
        (this.init.text.fontSize ?? 1) *
        relativeRadius *
        0.07
      ).toFixed(2)}rem "${this.init.text.fontFamily}"`;

      context2D.font = font;
      context2D.fillStyle = this.init.text.color ?? 'black';
      context2D.textAlign = 'center';
      context2D.textBaseline = 'middle';
      context2D.fillText(this.init.text.value, centerX, centerY);
    }

    if (this.init.border.color) {
      context2D.strokeStyle = this.init.border.color;
      context2D.lineWidth = this.init.border.size;
      context2D.stroke();
    }
    context2D.restore();
  }

  dispose() {}
}
