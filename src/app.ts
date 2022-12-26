import { AnimatedNodes } from './animated-nodes/animated-nodes';

async function main() {
  const an = new AnimatedNodes();
  await an.init(document.querySelector('.animated-graph')!);
  an.startRendering();
}

main();
