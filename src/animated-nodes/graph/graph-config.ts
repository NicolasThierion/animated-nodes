/*
 * Animated floating graph nodes
 *
 * Copyright (c) 2020 Project Nayuki
 * All rights reserved. Contact Nayuki for licensing.
 * https://www.nayuki.io/page/animated-floating-graph-nodes
 */
export interface AnimatedNodesConfig {
  gradient: {
    color1: () => string;
    color2: () => string;
    innerCenter: () => [number, number, number];
    outerCenter: () => [number, number, number];
  };
  background: {
    color: () => string;
  };
  nodes: {
    amount: number;
    speed: number; // 0 - 100
    fadeInPerFrame: number; // In the range (0.0, 1.0]
    fadeOutPerFrame: number; // In the range [-1.0, 0.0)
    repulsion: number; // 0 - 100
    init: () => {
      background: {
        color: string;
        img: string | undefined;
      };
      border: {
        size: number;
        color: string | undefined;
      };
      size: number;
      text: {
        fontSize: number | undefined;
        fontWeight: number | undefined;
        fontFamily: string | undefined;
        value: string | undefined;
        color: string | undefined;
      };
    };
  };
  edges: {
    init: () => {
      color: string;
      size: number;
    };
    extraEdgeProportion: number; // 0 - 100
  };
  radiiWeightPower: number; // 0 - 1
  borderFade: number;
  speed: number;
}
