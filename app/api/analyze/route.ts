import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { AnimationEvent, TemplateName } from "@/lib/animationTypes";
import { getCombinedSkillContent, detectSkillsForTemplates } from "@/lib/skills";

const VALID_TEMPLATES: TemplateName[] = [
  "LabelOverlay",
  "PillKaraoke",
  "MatrixDecode",
  "GradientFill",
  "TerminalCode",
  "SyncedCaption",
];

const BASE_SYSTEM_PROMPT = `Você é um editor de vídeo especialista em motion graphics.
Analise a transcrição fornecida e identifique entre 3 e 5 momentos para adicionar animações de texto.

REGRAS ABSOLUTAS:
- Use APENAS texto que aparece literalmente na transcrição. Não invente, não parafraseie.
- Retorne APENAS um array JSON puro, sem markdown, sem explicações, sem código de bloco.
- Gere entre 3 e 5 animações. Varie os templates conforme o tom — não use sempre o mesmo.
- Não sobreponha intervalos: cada evento deve ter startTime + duration <= próximo startTime.

Schema de cada objeto no array:
{ "template": string, "title": string, "subtitle": string, "startTime": number, "duration": number }

Exemplo de retorno:
[
  { "template": "MatrixDecode", "title": "97% dos casos", "subtitle": "detectados pelo algoritmo", "startTime": 5.2, "duration": 2.5 },
  { "template": "LabelOverlay", "title": "MUDA TUDO", "subtitle": "e ninguém percebeu", "startTime": 12.0, "duration": 3.0 }
]`;

/**
 * Step 1 — Skill Detection: ask gpt-4o-mini which templates are good candidates
 * for this transcription. Returns a subset of VALID_TEMPLATES.
 */
async function detectCandidateTemplates(
  client: OpenAI,
  transcriptionText: string,
): Promise<TemplateName[]> {
  const detectionPrompt = `Você receberá uma transcrição de vídeo. Sua tarefa é identificar quais templates de animação são candidatos relevantes para o conteúdo.

Templates disponíveis: ${VALID_TEMPLATES.join(", ")}

Retorne APENAS um array JSON com os nomes dos templates candidatos (subconjunto da lista acima), sem explicações.
Exemplo: ["LabelOverlay", "NeonGlow", "MatrixDecode"]

Transcrição:
${transcriptionText}`;

  try {
    const res = await client.chat.completions.create({
      model:       "gpt-4o-mini",
      messages:    [{ role: "user", content: detectionPrompt }],
      temperature: 0.1,
      max_tokens:  100,
    });

    const raw     = res.choices[0]?.message?.content ?? "[]";
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed  = JSON.parse(cleaned) as string[];

    if (!Array.isArray(parsed)) return VALID_TEMPLATES;

    return parsed.filter((t): t is TemplateName =>
      VALID_TEMPLATES.includes(t as TemplateName),
    );
  } catch {
    // If detection fails, fall back to all templates
    return VALID_TEMPLATES;
  }
}

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

  const effectivePrompt =
    userPrompt.trim() || "Identifique os 3 a 5 momentos de maior impacto.";

  try {
    // -----------------------------------------------------------------------
    // Step 1: Skill Detection (gpt-4o-mini)
    // -----------------------------------------------------------------------
    const candidateTemplates = await detectCandidateTemplates(client, transcriptionText);

    // -----------------------------------------------------------------------
    // Step 2: Skills Injection
    // -----------------------------------------------------------------------
    const relevantSkills    = detectSkillsForTemplates(candidateTemplates);
    const skillsContent     = getCombinedSkillContent(relevantSkills);
    const systemPrompt      = `${BASE_SYSTEM_PROMPT}\n\n---\n\n${skillsContent}`;

    // -----------------------------------------------------------------------
    // Step 3: Generation (gpt-4o)
    // -----------------------------------------------------------------------
    const userMessage = `Transcrição (use SOMENTE este conteúdo para os textos):
${transcriptionText}

Templates candidatos para este conteúdo: ${candidateTemplates.join(", ")}

Instrução adicional: ${effectivePrompt}`;

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

    let parsed: {
      template?: string;
      title?: string;
      subtitle?: string;
      startTime: number;
      duration: number;
    }[] = [];

    try {
      parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed)) parsed = [];
    } catch {
      console.error("[analyze] JSON parse failed:", cleaned.slice(0, 300));
      parsed = [];
    }

    const events: AnimationEvent[] = parsed.map((item, i) => {
      const template: TemplateName = VALID_TEMPLATES.includes(
        item.template as TemplateName,
      )
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
