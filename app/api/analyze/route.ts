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
Analise a transcrição e sugira animações usando APENAS os templates disponíveis.
Para cada momento impactante, escolha o template mais adequado ao conteúdo.

Templates disponíveis e quando usar:
- DarkReveal: frases de grande impacto, momentos climáticos, revelações importantes
- ImpactTitle: títulos, afirmações fortes, conclusões poderosas
- GlitchReveal: momentos de tensão, contraste, quebra de expectativa
- WordPop: listas, enumerações, sequências de palavras-chave
- SlideIn: introdução de conceitos, transições, contexto adicional
- BlurTitle: momentos contemplativos, frases reflexivas
- TrackingReveal: nomes, marcas, conceitos importantes
- ShimmerText: números, estatísticas, conquistas, resultados
- LiquidFill: palavras de uma sílaba para maior impacto visual
- FloatCard: dicas, contexto extra, informações complementares

Regras importantes:
- Gere entre 4 e 7 animações por vídeo
- NÃO sobreponha animações — respeite start + duration de cada uma
- Espaçe bem as animações ao longo do vídeo
- Props de texto devem ser CURTOS (máximo 4-5 palavras em CAPS)
- Retorne APENAS o array JSON, sem markdown, sem explicações

Formato de cada evento:
{
  "id": "ev-1",
  "template": "NomeDoTemplate",
  "startTime": <número em segundos>,
  "duration": <número entre 1.5 e 3.5>,
  "props": {
    "text": "TEXTO CURTO EM CAPS",
    "accentColor": "#cor_hex",
    "subtitle": "opcional para ImpactTitle",
    "direction": "left|right|top|bottom (para SlideIn)",
    "title": "TÍTULO (para FloatCard)",
    "body": "Corpo do card (para FloatCard)"
  }
}`;

  const userMessage = `Estilo de legenda: ${captionStyle}

Transcrição:
${transcriptionText}

Instrução: ${effectivePrompt}

Retorne o array JSON de animações:`;

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
