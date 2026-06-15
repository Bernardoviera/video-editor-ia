import { bundle } from '@remotion/bundler';
import { selectComposition, renderMedia } from '@remotion/renderer';
import path from 'path';

const CHROME = '/root/.cache/hyperframes/chrome/chrome-headless-shell/linux-131.0.6778.85/chrome-headless-shell-linux64/chrome-headless-shell';

const webpackOverride = (c) => ({
  ...c,
  module: {
    ...c.module,
    rules: [...(c.module?.rules ?? []), { test: /\.md$/, use: 'null-loader' }],
  },
});

const entryPoint = path.join(process.cwd(), 'remotion', 'index.tsx');
console.log('Bundling...');
const serveUrl = await bundle({ entryPoint, webpackOverride });
console.log('Bundle pronto.');

const DEMOS = [
  {
    name: 'LabelOverlay',
    events: [{ id: 'ev1', template: 'LabelOverlay', startTime: 0, duration: 3, props: { title: 'ISSO MUDOU TUDO', subtitle: 'e ninguém percebeu' } }],
    out: '/tmp/demo-label.gif',
  },
  {
    name: 'NeonGlow',
    events: [{ id: 'ev1', template: 'NeonGlow', startTime: 0, duration: 3, props: { title: 'INCRÍVEL', subtitle: 'isso vai mudar sua vida' } }],
    out: '/tmp/demo-neon.gif',
  },
  {
    name: 'MatrixDecode',
    events: [{ id: 'ev1', template: 'MatrixDecode', startTime: 0, duration: 3, props: { title: '97% dos casos', subtitle: 'detectados pelo algoritmo' } }],
    out: '/tmp/demo-matrix.gif',
  },
  {
    name: 'TerminalCode',
    events: [{ id: 'ev1', template: 'TerminalCode', startTime: 0, duration: 3.5, props: { title: 'npm run build', subtitle: 'Build concluído em 2.3s' } }],
    out: '/tmp/demo-terminal.gif',
  },
  {
    name: 'PillKaraoke',
    events: [{ id: 'ev1', template: 'PillKaraoke', startTime: 0, duration: 3, props: { title: '', subtitle: 'Vou explicar como funciona o algoritmo passo a passo' } }],
    out: '/tmp/demo-pill.gif',
  },
  {
    name: 'SyncedCaption',
    events: [{
      id: 'ev1', template: 'SyncedCaption', startTime: 0, duration: 3,
      props: {
        title: '', subtitle: 'e foi assim que tudo começou a mudar',
        tokens: [
          { text: 'e', fromMs: 0, toMs: 200 },
          { text: 'foi', fromMs: 200, toMs: 450 },
          { text: 'assim', fromMs: 450, toMs: 750 },
          { text: 'que', fromMs: 750, toMs: 950 },
          { text: 'tudo', fromMs: 950, toMs: 1300 },
          { text: 'começou', fromMs: 1300, toMs: 1800 },
          { text: 'a', fromMs: 1800, toMs: 2000 },
          { text: 'mudar', fromMs: 2000, toMs: 3000 },
        ],
      }
    }],
    out: '/tmp/demo-synced.gif',
  },
];

const chromiumOptions = { ignoreCertificateErrors: true, disableWebSecurity: true, gl: 'swiftshader' };

for (const demo of DEMOS) {
  console.log(`Renderizando ${demo.name}...`);
  const inputProps = { events: demo.events, width: 1080, height: 1920 };
  const durationInFrames = Math.ceil(demo.events[0].duration * 30);
  const composition = await selectComposition({ serveUrl, id: 'AnimationOverlay', inputProps, browserExecutable: CHROME, chromiumOptions });
  const comp = { ...composition, durationInFrames, fps: 30, width: 1080, height: 1920 };
  await renderMedia({ composition: comp, serveUrl, codec: 'gif', outputLocation: demo.out, inputProps, browserExecutable: CHROME, chromiumOptions, concurrency: 1 });
  console.log(`  ✓ ${demo.out}`);
}
console.log('Todos os demos gerados!');
