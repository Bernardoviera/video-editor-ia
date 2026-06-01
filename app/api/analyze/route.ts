import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { AnimationEvent, CaptionStyle } from "@/lib/animationTypes";

const DEFAULT_PROMPT =
  "Edite o vídeo de forma dinâmica e profissional. Identifique os 3-5 momentos mais impactantes, adicione destaques visuais nas frases mais fortes, use emojis relevantes ao contexto e crie telas de destaque para estatísticas ou afirmações importantes.";

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

  const systemPrompt = `Você é um editor de vídeo profissional especializado em conteúdo para redes sociais. \
Analise a transcrição e retorne SOMENTE um array JSON válido de animações para adicionar ao vídeo. \
Não inclua explicações, markdown, nem texto fora do JSON.

Tipos de animação disponíveis:
- dark_overlay: tela escurece + texto/emoji animado no centro (para frases de impacto)
- text_zoom: palavra ou frase cresce na tela por cima do vídeo
- emoji_pop: emoji grande aparece com bounce
- highlight_box: caixa colorida com texto em um canto

Formato de cada evento:
{
  "id": "uuid-único",
  "type": "dark_overlay|text_zoom|emoji_pop|highlight_box",
  "startTime": <número em segundos>,
  "duration": <número em segundos, entre 1.0 e 4.0>,
  "content": { "text": "TEXTO EM CAPS", "emoji": "🔥", "color": "#00c4f0" },
  "position": "center|top|bottom",
  "intensity": "low|medium|high"
}

Regras:
- Gere entre 3 e 6 eventos
- Não sobreponha eventos (respeite start + duration de cada um)
- Retorne APENAS o array JSON, sem nenhum texto adicional`;

  const userMessage = `Estilo de legenda selecionado: ${captionStyle}

Transcrição:
${transcriptionText}

Instrução do usuário: ${effectivePrompt}

Retorne o array JSON de animações:`;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const raw = completion.choices[0]?.message?.content ?? "[]";
    const cleaned = raw
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let events: AnimationEvent[] = [];
    try {
      events = JSON.parse(cleaned);
      if (!Array.isArray(events)) events = [];
    } catch {
      console.error("[analyze] JSON parse failed:", cleaned.slice(0, 200));
      events = [];
    }

    // Sort by startTime and ensure IDs exist
    events = events
      .map((e, i) => ({ ...e, id: e.id || `event-${i}-${Date.now()}` }))
      .sort((a, b) => a.startTime - b.startTime);

    return NextResponse.json({ events });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro na análise.";
    console.error("[analyze]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
