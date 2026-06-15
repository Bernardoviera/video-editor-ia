import { bundle } from '@remotion/bundler';
import { selectComposition, renderMedia } from '@remotion/renderer';
import path from 'path';

const CHROME = '/root/.cache/hyperframes/chrome/chrome-headless-shell/linux-131.0.6778.85/chrome-headless-shell-linux64/chrome-headless-shell';

const events = [{
  id: 'ev1', template: 'GradientFill', startTime: 0, duration: 3,
  props: { title: 'CHEGAMOS', subtitle: 'até aqui' },
}];

const entryPoint = path.join(process.cwd(), 'remotion', 'index.tsx');
const serveUrl = await bundle({ entryPoint,
  webpackOverride: (c) => ({ ...c, module: { ...c.module, rules: [...(c.module?.rules ?? []), { test: /\.md$/, use: 'null-loader' }] } }) });
const inputProps = { events, width: 1080, height: 1920 };
const composition = await selectComposition({ serveUrl, id: 'AnimationOverlay', inputProps,
  browserExecutable: CHROME, chromiumOptions: { ignoreCertificateErrors: true, gl: 'swiftshader' } });
const comp = { ...composition, durationInFrames: 90, fps: 30, width: 1080, height: 1920 };

await renderMedia({ composition: comp, serveUrl, codec: 'gif', outputLocation: '/tmp/demo.gif',
  inputProps, browserExecutable: CHROME,
  chromiumOptions: { ignoreCertificateErrors: true, disableWebSecurity: true, gl: 'swiftshader' }, concurrency: 1 });
console.log('GIF gerado');
