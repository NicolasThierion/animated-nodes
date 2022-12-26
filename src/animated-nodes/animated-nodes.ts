import {
  AnimatedNodesInit,
  AnimatedNodesRenderer,
} from './graph/graph-renderer';
import './animated-nodes.scss';
import { sample } from 'lodash';

const [SPEED, FRAMERATE] = [20, 60];

const ICONS: [string, string][] = [
  [unicode('f544'), 'Font Awesome 6 Free'], // fal fa-robot
];

export class AnimatedNodes {
  private canvasEl!: HTMLCanvasElement;
  private gradient1El!: HTMLElement;
  private gradient2El!: HTMLElement;
  private backgroundEl!: HTMLElement;
  private nodesEl!: HTMLElement;
  private _renderer!: AnimatedNodesRenderer;

  private async loadTemplate(root: HTMLElement): Promise<void> {
    const t = (await import('./animated-nodes.html' as string))[2];
    root.innerHTML = t;
    this.canvasEl = root.querySelector('canvas')!;
    this.gradient1El = root.querySelector('.gradient-1')!;
    this.gradient2El = root.querySelector('.gradient-2')!;
    this.backgroundEl = root.querySelector('.background')!;
    this.nodesEl = root.querySelector('.nodes')!;
  }

  async init(root: HTMLElement) {
    await this.loadTemplate(root);

    const nodeColors = Array.from(
      this.nodesEl.querySelectorAll('.node-background'),
    ).map((e) => window?.getComputedStyle(e).backgroundColor);

    const nodeTexts = Array.from(
      this.nodesEl.querySelectorAll('.node-text'),
    ).map((e) => window?.getComputedStyle(e).backgroundColor);

    const [backgroundColor, gradient1, gradient2] = [
      this.backgroundEl,
      this.gradient1El,
      this.gradient2El,
    ].map((e) => window.getComputedStyle(e).backgroundColor);
    const config: AnimatedNodesInit = {
      nodes: {
        repulsion: 3,
        amount: 30,
        init: () => {
          const [textValue, fontFamily]: [string, string] = sample(
            ICONS,
          ) as any;
          return {
            background: {
              color: sample(nodeColors),
            },
            text: {
              value: textValue,
              color: sample(nodeTexts),
              fontWeight: 100,
              fontFamily: fontFamily,
            },
          };
        },
      },
      edges: {
        init: () => ({
          color: '#FAFAFA88',
        }),
      },
      background: {
        color: () => backgroundColor,
      },
      gradient: {
        color1: () => gradient1,
        color2: () => gradient2,
      },
    };

    this._renderer = new AnimatedNodesRenderer(this.canvasEl, config);
  }

  stop() {
    this._renderer.stop();
  }

  startRendering() {
    this._renderer.speed = SPEED;
    this._renderer.framerate = FRAMERATE;
    this._renderer.render();
  }

  stopRendering() {
    this._renderer.stop();
  }
}

function unicode(char: string) {
  return String.fromCharCode(parseInt(char, 16));
}
