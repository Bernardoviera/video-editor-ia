<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:remotion-agent-rules -->
# Remotion — leia isto ANTES de escrever qualquer animação

## Regras obrigatórias

1. **Frame-based, não time-based.** Nunca use `setTimeout`, `setInterval`, `Date.now()`, `Math.random()` puro, ou qualquer API que dependa de tempo real. Toda lógica de animação deve ser derivada de `useCurrentFrame()` — o resultado precisa ser determinístico por frame para o renderer funcionar corretamente.

2. **`spring()` é a base de movimento.** Use sempre `spring({ frame, fps, config })` para transições com física. Nunca anime com CSS `transition` ou `animation` — o renderer captura frames estáticos, não reproduz CSS transitions.

3. **`interpolate()` para mapear valores.** Use `extrapolateLeft: 'clamp'` e `extrapolateRight: 'clamp'` sempre que o valor não deve extrapolar além do range definido (evita blur negativo, scale negativo, etc).

4. **Delays por subtração de frame.** Para atrasar uma animação N frames: `spring({ frame: Math.max(0, frame - N), fps, config })`. Nunca use async/await para delay.

5. **Fontes via `@remotion/google-fonts`.** Use `loadFont()` do pacote correto. O `LabelOverlay` usa **Anton** (`@remotion/google-fonts/Anton`, só peso 400) — fonte display condensada do estilo kinetic-slam. Para texto corrido use Inter (700/800; peso 900 não existe no Inter).

6. **`imageFormat: 'png'` obrigatório com `pixelFormat: 'yuva420p'`** (transparência). Sem isso a exportação quebra.

7. **FFmpeg `enable=` sem backslash.** Use `enable='between(t,5.000,8.000)'` — nunca `enable='between(t\,5\,8)'`.

8. **Cada componente Remotion deve ser puro.** Sem side effects fora de hooks. Sem fetch dentro de componentes — dados vêm via props.

9. **`useVideoConfig()`** retorna `{ fps, durationInFrames, width, height, id }`. Use sempre para calcular timing relativo ao vídeo.

10. **Não inventar texto.** O GPT-4 nunca deve gerar texto que não veio da transcrição do usuário.

## Stack atual deste projeto

- Templates em `remotion/templates/` — cada arquivo exporta uma função React
- Tipos em `lib/animationTypes.ts` — sempre atualizar `TemplateProps` ao adicionar props
- Identidade visual do `LabelOverlay` (estilo kinetic-slam, baseado no HyperFrames): fundo `#000000`, texto `#FFFFFF`, destaque dourado `#FFD700`, fonte Anton uppercase. Uma palavra gigante por vez, centralizada, com 4 modos de entrada alternados (cima/esquerda/direita/zoom) e overshoot.
- Templates ativos: `LabelOverlay` (único)

## Antes de escrever código Remotion

1. Verifique se `node_modules/@remotion/` existe e leia o `CHANGELOG.md` ou `README.md` do pacote relevante
2. Consulte https://www.remotion.dev/docs se houver dúvida sobre API específica
3. Nunca quebre os bugs já corrigidos listados no `CLAUDE.md`
<!-- END:remotion-agent-rules -->
