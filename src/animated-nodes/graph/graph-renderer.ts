import { defaultsDeep } from 'lodash';
import { CanvasContext } from './canvas/canvas-context';
import { CanvasGraph } from './canvas/canvas-graph';
import { AnimatedNodesConfig } from './graph-config';

type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P] extends () => infer U
    ? RecursivePartial<U>
    : T[P];
};

export type AnimatedNodesInit = RecursivePartial<AnimatedNodesConfig>;

export class AnimatedNodesRenderer {
  static readonly DEFAULTS: AnimatedNodesConfig = {
    nodes: {
      amount: 16,
      speed: 0.5,
      fadeInPerFrame: 0.06,
      fadeOutPerFrame: -0.03,
      repulsion: 10,
      init: () => ({
        background: {
          color: '#575E85',
          img: undefined,
        },

        border: {
          color: undefined,
          size: 0,
        },
        size: (Math.random() + 0.35) * 0.015 * 2, // Radius skewing toward smaller values,,
        text: {
          value: undefined,
          color: undefined,
          fontFamily: undefined,
          fontWeight: undefined,
          fontSize: undefined,
        },
      }),
    },
    gradient: {
      color1: () => '#575E8588',
      color2: () => '#2E3145AA',
      innerCenter: () => [0.5, 0.9, 0.1],
      outerCenter: () => [0.5, 0.9, 0.6],
    },
    background: {
      color: () => '#0d6efd',
    },
    edges: {
      extraEdgeProportion: 75,
      init: () => ({
        color: 'rgb(129,139,197)',
        size: 2,
      }),
    },
    radiiWeightPower: 0.1,
    borderFade: -0.02,
    speed: 20,
  };

  private _graph: CanvasGraph;
  private _config: AnimatedNodesConfig;
  private _speed: number = 60;
  private _framerate: number = 60;

  private subscriptions: (() => void)[] = [];

  private _started = false;
  set speed(ops: number) {
    this._speed = ops;
    if (this._started) {
      this.stop().render();
    }
  }

  get speed() {
    return this._speed;
  }

  set framerate(framerate: number) {
    this._framerate = framerate;
    if (this._started) {
      this.stop().render();
    }
  }

  get framerate() {
    return this._speed;
  }

  constructor(canvas: HTMLCanvasElement, config?: AnimatedNodesInit) {
    this._config = this._normalizeConfig(config);
    const canvasContext: CanvasContext = {
      canvas,
      context2D: canvas.getContext('2d')!,
      nodes: this._config.nodes.init,
      edges: this._config.edges.init,
      gradient: this._config.gradient,
      background: this._config.background,
    };
    this._graph = new CanvasGraph(this._config, canvasContext);
    this._speed = config!.speed!;
    // canvasContext.context2D.imageSmoothingEnabled = true;
  }

  private _normalizeConfig(config?: AnimatedNodesInit): AnimatedNodesConfig {
    const fullConfig: AnimatedNodesConfig = defaultsDeep(
      {},
      config,
      AnimatedNodesRenderer.DEFAULTS,
    );

    return {
      ...fullConfig,
      radiiWeightPower: fullConfig.radiiWeightPower,
      ...{
        nodes: {
          ...fullConfig?.nodes,
          amount: Math.round(fullConfig.nodes.amount),
          repulsion: fullConfig.nodes.repulsion * 0.000001,
          speed: fullConfig.nodes.speed * 0.0001,
          init: () => ({
            ...defaultsDeep(
              {},
              (config?.nodes?.init as any)?.(),
              AnimatedNodesRenderer.DEFAULTS.nodes.init(),
            ),
          }),
        },
        edges: {
          ...fullConfig.edges,
          extraEdgeProportion: fullConfig.edges.extraEdgeProportion / 100,
        },
      },
    };
  }

  render(): this {
    if (this._started) {
      return this;
    }
    this._started = true;

    // Initialize the graph, form inputs, SVG output

    this._graph.setOutput().redrawOutput();

    const resizeListener = () => this._graph.setOutput().redrawOutput();
    window.addEventListener('resize', resizeListener);

    // Periodically update graph
    const updateInterval = setInterval(() => {
      this._graph.stepFrame();
    }, Math.floor(1000 / this._speed));

    // Periodically draw the animation
    const drawInterval = setInterval(
      () => this._graph.redrawOutput(),
      Math.floor(1000 / this._framerate),
    );

    this.subscriptions.push(
      () => removeEventListener('resize', resizeListener),
      () => clearInterval(updateInterval),
      () => clearInterval(drawInterval),
    );

    return this;
  }

  stop() {
    this._started = false;
    this.subscriptions.forEach((s) => s());
    this.subscriptions = [];
    return this;
  }
}
