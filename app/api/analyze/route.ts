import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { AnimationEvent, CaptionStyle } from "@/lib/animationTypes";

const DEFAULT_PROMPT =
  "Edite o vídeo de forma dinâmica e profissional. Identifique os 3-5 momentos mais impactantes, adicione destaques visuais nas frases mais fortes, use o template mais adequado para cada momento.";

export async function POST(req: NextRequest) {
  const { segments, userPrompt, captionStyle } = (await req.json()) as {
    segments: { id: number; start: number; end: number; text: string }[];
    userPrompt: string;
    captionStyle: CaptionStyle;
  };

  if (!segments?.length) {
    return NextResponse.json({ error: "Segmentos ausentes." }, { status: 400 });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 0 });

  const transcriptionText = segments
    .map((s) => `[${s.start.toFixed(1)}s → ${s.end.toFixed(1)}s] ${s.text}`)
    .join("\n");

  const effectivePrompt = userPrompt.trim() || DEFAULT_PROMPT;

  const systemPrompt = `Você é um editor de vídeo profissional especializado em motion design para redes sociais.

REGRA ABSOLUTA: Todo texto nas props das animações deve ser retirado LITERALMENTE da transcrição fornecida pelo usuário. NUNCA invente, parafraseie ou use textos de exemplo. Se a transcrição não contiver um número ou frase adequada para determinado template, não use esse template.

Templates disponíveis e quando usar (leia os campos de props com atenção):

LabelOverlay — vídeo continua, overlay leve. Use para frases de impacto curtas.
  props: { title: "PALAVRA(S) DA TRANSCRIÇÃO EM CAPS (3-4 palavras)", subtitle: "frase ou número da transcrição" }

StatCard — tela cheia azul. Use APENAS quando houver número/percentual/estatística real na transcrição.
  props: { value: "número exato da transcrição", category: "contexto do número (da transcrição)", context: "frase explicativa da transcrição" }

MoneyCard — overlay pesado. Use APENAS quando houver valor monetário real na transcrição.
  props: { value: "valor exato da transcrição", label: "o que representa (da transcrição)", accent: "palavra de contexto da transcrição" }

DarkReveal — frases de grande impacto, revelações importantes.
  props: { text: "FRASE CURTA DA TRANSCRIÇÃO" }

ImpactTitle — afirmações fortes, conclusões.
  props: { text: "FRASE DA TRANSCRIÇÃO", subtitle: "complemento da transcrição (opcional)" }

GlitchReveal — momentos de tensão ou contraste.
  props: { text: "FRASE DA TRANSCRIÇÃO" }

WordPop — listas ou sequências de palavras-chave.
  props: { text: "PALAVRAS DA TRANSCRIÇÃO" }

SlideIn — introdução de conceitos ou contexto.
  props: { text: "FRASE DA TRANSCRIÇÃO", direction: "left|right|top|bottom" }

ShimmerText — números, estatísticas ou conquistas.
  props: { text: "NÚMERO OU STAT DA TRANSCRIÇÃO" }

FloatCard — dicas ou informações complementares.
  props: { title: "TÍTULO DA TRANSCRIÇÃO", body: "corpo do card da transcrição" }

Regras de estrutura:
- Gere entre 4 e 7 animações por vídeo
- NÃO sobreponha animações — respeite startTime + duration de cada uma
- Espaçe as animações ao longo do vídeo
- Retorne APENAS o array JSON, sem markdown, sem explicações`;

  const userMessage = `Transcrição do vídeo (USE APENAS ESTE CONTEÚDO para os textos das animações):
${transcriptionText}

Instrução adicional: ${effectivePrompt}

Formato de cada evento no array:
{
  "id": "ev-1",
  "template": "NomeDoTemplate",
  "startTime": <segundos do momento na transcrição>,
  "duration": <número entre 1.5 e 3.5>,
  "props": { <campos do template conforme acima, texto APENAS da transcrição> }
}

Retorne o array JSON:`;

  try {
    const completion = await client.chat.completions.create({
      model:       "gpt-4o",
      messages:    [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userMessage },
      ],
      temperature: 0.65,
      max_tokens:  2000,
    });

    const raw     = completion.choices[0]?.message?.content ?? "[]";
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let events: AnimationEvent[] = [];
    try {
      events = JSON.parse(cleaned);
      if (!Array.isArray(events)) events = [];
    } catch {
      console.error("[analyze] JSON parse failed:", cleaned.slice(0, 300));
      events = [];
    }

    const VALID_TEMPLATES = new Set([
      "LabelOverlay","StatCard","MoneyCard",
      "DarkReveal","ImpactTitle","GlitchReveal","WordPop","SlideIn",
      "BlurTitle","TrackingReveal","ShimmerText","LiquidFill","FloatCard",
    ])

    events = events
      .filter((e) => VALID_TEMPLATES.has(e.template))
      .map((e, i) => ({
        ...e,
        id:       e.id || `ev-${i}-${Date.now()}`,
        duration: Math.max(1.5, Math.min(4.0, e.duration ?? 2)),
        props:    e.props ?? {},
      }))
      .sort((a, b) => a.startTime - b.startTime);

    return NextResponse.json({ events });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro na análise.";
    console.error("[analyze]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
