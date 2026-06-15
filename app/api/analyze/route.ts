import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { AnimationEvent, TemplateName } from "@/lib/animationTypes";

const VALID_TEMPLATES: TemplateName[] = [
  "LabelOverlay",
  "PillKaraoke",
  "NeonGlow",
  "MatrixDecode",
  "GradientFill",
  "TerminalCode",
];

export async function POST(req: NextRequest) {
  const { segments, userPrompt } = (await req.json()) as {
    segments: { id: number; start: number; end: number; text: string }[];
    userPrompt: string;
  };

  if (!segments?.length) {
    return NextResponse.json({ error: "Segmentos ausentes." }, { status: 400 });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 0 });

  const transcriptionText = segments
    .map((s) => `[${s.start.toFixed(1)}s → ${s.end.toFixed(1)}s] ${s.text}`)
    .join("\n");

  const effectivePrompt = userPrompt.trim() || "Identifique os 3 a 5 momentos de maior impacto.";

  const systemPrompt = `Você é um editor de vídeo. Analise a transcrição e identifique os momentos mais impactantes para adicionar animações de texto.

REGRA ABSOLUTA: Use APENAS texto que aparece literalmente na transcrição. Não invente, não parafraseie.

Para CADA momento você também escolhe o ESTILO de animação que combina com o TOM do que está sendo dito. Estilos disponíveis (campo "template"):
- "LabelOverlay": palavra gigante por vez, impacto máximo. Use em FRASES DE PUNCH, afirmações fortes, chamadas de atenção.
- "PillKaraoke": legenda limpa estilo Reels. Use em NARRAÇÃO NEUTRA, explicações, conteúdo informativo.
- "NeonGlow": neon ciano/rosa brilhante. Use em momentos de HYPE, energia, empolgação, hype de produto.
- "MatrixDecode": texto verde que decodifica (hacker). Use em TECNOLOGIA, dados, números, revelações, "segredos".
- "GradientFill": gradiente colorido fluido (premium). Use em momentos EMOCIONAIS, aspiracionais, sofisticados.
- "TerminalCode": janela de terminal macOS digitando um comando e sua saída. Use quando o conteúdo for CÓDIGO, COMANDOS, programação, dev, ferramentas técnicas. Neste caso "title" = o comando (ex: "npm run build"), "subtitle" = a saída/resultado.

Para cada momento, retorne um objeto com:
- "template": um dos 5 valores acima, escolhido pelo tom
- "title": frase curta de impacto retirada da transcrição (2 a 4 palavras, TODAS EM MAIÚSCULAS)
- "subtitle": complemento ou continuação do que foi dito (pode ser frase completa, capitalização normal)
- "startTime": número em segundos (quando começa na transcrição)
- "duration": número entre 2.0 e 3.5 segundos

Gere entre 3 e 5 animações. Varie os estilos conforme o tom — não use sempre o mesmo. Não sobreponha intervalos. Espaçe bem ao longo do vídeo.

Retorne APENAS um array JSON puro, sem markdown, sem explicações:
[
  { "template": "NeonGlow", "title": "TÍTULO EM CAPS", "subtitle": "complemento da frase", "startTime": 5.2, "duration": 2.5 },
  ...
]`;

  const userMessage = `Transcrição (use SOMENTE este conteúdo para os textos):
${transcriptionText}

Instrução adicional: ${effectivePrompt}`;

  try {
    const completion = await client.chat.completions.create({
      model:       "gpt-4o",
      messages:    [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userMessage },
      ],
      temperature: 0.4,
      max_tokens:  1000,
    });

    const raw     = completion.choices[0]?.message?.content ?? "[]";
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let parsed: { template?: string; title?: string; subtitle?: string; startTime: number; duration: number }[] = [];
    try {
      parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed)) parsed = [];
    } catch {
      console.error("[analyze] JSON parse failed:", cleaned.slice(0, 300));
      parsed = [];
    }

    const events: AnimationEvent[] = parsed.map((item, i) => {
      const template: TemplateName = VALID_TEMPLATES.includes(item.template as TemplateName)
        ? (item.template as TemplateName)
        : "LabelOverlay";
      return {
        id:        `ev-${i}-${Date.now()}`,
        template,
        startTime: typeof item.startTime === "number" ? item.startTime : 0,
        duration:  Math.max(2.0, Math.min(3.5, item.duration ?? 2.5)),
        props: {
          title:    item.title ?? "",
          subtitle: item.subtitle ?? "",
        },
      };
    });

    return NextResponse.json({ events });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro na análise.";
    console.error("[analyze]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
