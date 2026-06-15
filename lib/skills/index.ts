import type { TemplateName } from '../animationTypes'

export type SkillName = 'remotion-rules' | 'template-tones' | 'prop-patterns'

// ---------------------------------------------------------------------------
// Skill: remotion-rules
// ---------------------------------------------------------------------------
const REMOTION_RULES = `# Remotion — Regras Obrigatórias

1. **Frame-based, não time-based.** Nunca use \`setTimeout\`, \`setInterval\`, \`Date.now()\`, \`Math.random()\` puro, ou qualquer API que dependa de tempo real. Toda lógica de animação deve ser derivada de \`useCurrentFrame()\` — o resultado precisa ser determinístico por frame.

2. **\`spring()\` é a base de movimento.** Use sempre \`spring({ frame, fps, config })\` para transições com física. Nunca anime com CSS \`transition\` ou \`animation\` — o renderer captura frames estáticos, não reproduz CSS transitions.

3. **\`interpolate()\` para mapear valores.** Use \`extrapolateLeft: 'clamp'\` e \`extrapolateRight: 'clamp'\` sempre que o valor não deve extrapolar além do range definido (evita blur negativo, scale negativo, etc).

4. **Delays por subtração de frame.** Para atrasar uma animação N frames: \`spring({ frame: Math.max(0, frame - N), fps, config })\`. Nunca use async/await para delay.

5. **Fontes via \`@remotion/google-fonts\`.** Use \`loadFont()\` do pacote correto. O \`LabelOverlay\` usa **Anton** (\`@remotion/google-fonts/Anton\`, só peso 400). Para texto corrido use Inter (700/800; peso 900 não existe no Inter).

6. **\`imageFormat: 'png'\` obrigatório com \`pixelFormat: 'yuva420p'\`** (transparência). Sem isso a exportação quebra.

7. **FFmpeg \`enable=\` sem backslash.** Use \`enable='between(t,5.000,8.000)'\` — nunca \`enable='between(t\\,5\\,8)'\`.

8. **Cada componente Remotion deve ser puro.** Sem side effects fora de hooks. Sem fetch dentro de componentes — dados vêm via props.

9. **\`useVideoConfig()\`** retorna \`{ fps, durationInFrames, width, height, id }\`. Use sempre para calcular timing relativo ao vídeo.

10. **Não inventar texto.** Nunca gere texto que não veio da transcrição do usuário.
`

// ---------------------------------------------------------------------------
// Skill: template-tones
// ---------------------------------------------------------------------------
const TEMPLATE_TONES = `# Quando Usar Cada Template pelo Tom do Conteúdo

## LabelOverlay — Kinetic Slam
- **Tom:** impacto, punch, força, declarações fortes, chamadas de atenção
- **Use quando:** o trecho tem uma frase curta e poderosa, afirmação categórica, slogan
- **Exemplos de contexto:** "Isso mudou tudo", "Nunca mais será o mesmo", "O segredo é esse"

## PillKaraoke — Pill Karaoke
- **Tom:** neutro, informativo, explicativo, narrativo
- **Use quando:** o conteúdo é narração contínua, explicação técnica, ou conteúdo educativo sem emoção excessiva
- **Exemplos de contexto:** explicações passo a passo, tutoriais, histórias

## NeonGlow — Neon Glow
- **Tom:** hype, energia, empolgação, entusiasmo, produtos/lançamentos
- **Use quando:** o trecho transmite animação, vibração, empolgação, lançamento de produto
- **Exemplos de contexto:** "Isso é incrível!", "Lançando agora", "Você não vai acreditar"

## MatrixDecode — Matrix Decode
- **Tom:** tecnologia, dados, números, revelações, "segredos", hacking
- **Use quando:** o conteúdo menciona estatísticas, código, dados técnicos, descobertas, revelações surpreendentes
- **Exemplos de contexto:** "97% dos dados", "o algoritmo usa", "a falha foi encontrada"

## GradientFill — Gradient Fill
- **Tom:** emocional, aspiracional, sofisticado, premium, inspiracional
- **Use quando:** o momento é de reflexão, conquista, aspiração, beleza, sofisticação
- **Exemplos de contexto:** "Sonhos se tornam realidade", "O caminho foi longo", "Chegamos até aqui"

## TerminalCode — Terminal Code
- **Tom:** código, comandos, programação, desenvolvimento, ferramentas técnicas, CLI
- **Use quando:** o conteúdo menciona comandos de terminal, código, configuração de ferramentas, deploy
- **Exemplos de contexto:** "npm run build", "git push", "docker compose up", código Python/JS/etc

## SyncedCaption — Synced Caption
- **Tom:** qualquer — para quando se quer destacar LITERALMENTE a fala como legenda animada
- **Use quando:** o objetivo é mostrar a fala palavra por palavra sincronizada com o áudio, estilo TikTok
- **Exemplos de contexto:** trechos importantes de fala que merecem destaque visual total
`

// ---------------------------------------------------------------------------
// Skill: prop-patterns
// ---------------------------------------------------------------------------
const PROP_PATTERNS = `# Padrões de Preenchimento de Props por Template

## LabelOverlay
- \`title\`: frase curta em CAPS (2-4 palavras), retirada da transcrição
- \`subtitle\`: complemento ou continuação da frase (capitalização normal)
- Exemplo: \`{ "title": "ISSO MUDOU TUDO", "subtitle": "e ninguém percebeu" }\`

## PillKaraoke
- \`title\`: deixar vazio (\`""\`)
- \`subtitle\`: frase completa da transcrição, capitalização normal
- Exemplo: \`{ "title": "", "subtitle": "Vou explicar como funciona o algoritmo passo a passo" }\`

## NeonGlow
- \`title\`: palavra-chave de impacto em CAPS (1-3 palavras)
- \`subtitle\`: contexto ou frase de apoio (capitalização normal)
- Exemplo: \`{ "title": "INCRÍVEL", "subtitle": "isso vai mudar sua vida" }\`

## MatrixDecode
- \`title\`: dado, número, revelação ou termo técnico
- \`subtitle\`: contexto técnico ou explicação breve
- Exemplo: \`{ "title": "97% dos casos", "subtitle": "são detectados pelo algoritmo" }\`

## GradientFill
- \`title\`: frase emocional em CAPS (3-5 palavras)
- \`subtitle\`: complemento sofisticado (capitalização normal)
- Exemplo: \`{ "title": "CHEGAMOS ATÉ AQUI", "subtitle": "depois de tanto esforço" }\`

## TerminalCode
- \`title\`: o comando EXATO mencionado (ex: \`"npm run build"\`, \`"git push origin main"\`)
- \`subtitle\`: resultado/saída do comando ou contexto (ex: \`"Build concluído em 2.3s"\`)
- Exemplo: \`{ "title": "docker compose up", "subtitle": "Serviços iniciados com sucesso" }\`

## SyncedCaption
- \`title\`: deixar vazio (\`""\`) — a sincronização é automática
- \`subtitle\`: frase EXATA falada no trecho (copiada literalmente da transcrição)
- Exemplo: \`{ "title": "", "subtitle": "e foi assim que tudo começou a mudar" }\`

## Regras gerais
- NUNCA invente texto que não aparece na transcrição
- \`startTime\` deve ser o segundo exato do início do trecho na transcrição
- \`duration\` deve estar entre 2.0 e 3.5 segundos
- Não sobreponha intervalos: cada evento deve ter \`startTime + duration <= próximo startTime\`
`

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const SKILLS: Record<SkillName, string> = {
  'remotion-rules': REMOTION_RULES,
  'template-tones': TEMPLATE_TONES,
  'prop-patterns':  PROP_PATTERNS,
}

export function getSkillContent(skill: SkillName): string {
  return SKILLS[skill]
}

export function getCombinedSkillContent(skills: SkillName[]): string {
  return skills.map((s) => SKILLS[s]).join('\n\n---\n\n')
}

/**
 * Given the detected candidate templates, returns which skills are relevant
 * to inject into the generation prompt.
 * Always includes remotion-rules + template-tones.
 * Includes prop-patterns whenever any specific template is detected.
 */
export function detectSkillsForTemplates(templates: TemplateName[]): SkillName[] {
  const skills: SkillName[] = ['remotion-rules', 'template-tones']
  if (templates.length > 0) {
    skills.push('prop-patterns')
  }
  return skills
}
