import React from "react";
import { loadFont } from "@remotion/google-fonts/JetBrainsMono";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { TemplateProps } from "../../lib/animationTypes";

// Porta do code-snippet-apple-terminal-clear-dark (HyperFrames).
// Janela estilo macOS (dark), texto monospace verde que "digita" linha a linha
// com cursor piscando determinístico. Bom para momentos de código / tech / dev.
const { fontFamily } = loadFont("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

const BG_WINDOW = "rgba(22, 24, 28, 0.96)";
const BG_TITLEBAR = "rgba(38, 41, 47, 0.96)";
const PROMPT = "#5AF78E"; // verde do prompt ($)
const OUTPUT = "#E4E6EB"; // texto de saída claro
const DOT_RED = "#FF5F56";
const DOT_YELLOW = "#FFBD2E";
const DOT_GREEN = "#27C93F";

interface TermLine {
  prefix: string; // "$ " no comando, "" nas saídas
  text: string;
  isCommand: boolean;
}

// Quebra um texto em linhas de no máximo `maxChars` respeitando palavras.
function wrap(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if (current.length === 0) {
      current = w;
    } else if (current.length + 1 + w.length <= maxChars) {
      current += " " + w;
    } else {
      lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

// Monta as linhas do terminal: title vira o comando ($ ...), subtitle a saída.
function buildLines(title: string, subtitle: string, maxChars: number): TermLine[] {
  const out: TermLine[] = [];
  const cmd = (title ?? "").trim();
  if (cmd) {
    out.push({ prefix: "$ ", text: cmd, isCommand: true });
  }
  const sub = (subtitle ?? "").trim();
  if (sub) {
    for (const line of wrap(sub, maxChars)) {
      out.push({ prefix: "", text: line, isCommand: false });
    }
  }
  return out.length ? out : [{ prefix: "$ ", text: "", isCommand: true }];
}

export function TerminalCode({
  title       = "",
  subtitle    = "",
  accentColor = PROMPT,
}: TemplateProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width } = useVideoConfig();

  // Layout da janela ~ 72% da largura, fonte monospace proporcional.
  const winWidth = Math.round(width * 0.72);
  const fontSize = Math.round(width * 0.026);
  const charWidth = fontSize * 0.6; // JetBrains Mono ~0.6em por caractere
  const padX = Math.round(fontSize * 1.4);
  const maxChars = Math.max(12, Math.floor((winWidth - padX * 2) / charWidth));

  const lines = buildLines(title, subtitle, maxChars);
  const totalChars = lines.reduce((acc, l) => acc + l.prefix.length + l.text.length, 0);

  // Entrada da janela: leve subida + escala (spring sem bounce, cinema).
  const enter = spring({
    frame,
    fps,
    config: { damping: 100, stiffness: 200 },
    durationInFrames: 10,
  });
  const winScale = interpolate(enter, [0, 1], [0.96, 1], { extrapolateRight: "clamp" });
  const winY = interpolate(enter, [0, 1], [30, 0], { extrapolateRight: "clamp" });
  const winOpacity = interpolate(enter, [0, 0.6], [0, 1], { extrapolateRight: "clamp" });

  // Digitação: revela caractere a caractere durante os primeiros ~65% do slot.
  const typeStart = 6; // espera a janela aparecer
  const typeEnd = Math.max(typeStart + 1, Math.floor(durationInFrames * 0.65));
  const typed = Math.floor(
    interpolate(frame, [typeStart, typeEnd], [0, totalChars], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const doneTyping = typed >= totalChars;

  // Cursor piscando determinístico (a cada 15 frames).
  const cursorOn = Math.floor(frame / 15) % 2 === 0;

  // Distribui os caracteres revelados linha a linha.
  let remaining = typed;
  const rendered = lines.map((line) => {
    const full = line.prefix + line.text;
    const shown = Math.max(0, Math.min(full.length, remaining));
    remaining -= full.length;
    const isLastVisible = shown > 0 && shown < full.length;
    return { full, shown: full.slice(0, shown), active: isLastVisible };
  });

  // O cursor fica na última linha enquanto digita; quando termina, fica no fim.
  let cursorLineIndex = rendered.findIndex((r) => r.active);
  if (cursorLineIndex === -1 && doneTyping) cursorLineIndex = rendered.length - 1;

  const accent = accentColor ?? PROMPT;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: winWidth,
          borderRadius: 14,
          overflow: "hidden",
          background: BG_WINDOW,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 40px 120px rgba(0,0,0,0.55)",
          transform: `translateY(${winY}px) scale(${winScale})`,
          opacity: winOpacity,
          willChange: "transform, opacity",
        }}
      >
        {/* Barra de título estilo macOS */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: fontSize * 0.5,
            height: fontSize * 2,
            padding: `0 ${padX}px`,
            background: BG_TITLEBAR,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span style={{ width: fontSize * 0.62, height: fontSize * 0.62, borderRadius: "50%", background: DOT_RED }} />
          <span style={{ width: fontSize * 0.62, height: fontSize * 0.62, borderRadius: "50%", background: DOT_YELLOW }} />
          <span style={{ width: fontSize * 0.62, height: fontSize * 0.62, borderRadius: "50%", background: DOT_GREEN }} />
        </div>

        {/* Corpo do terminal */}
        <div
          style={{
            fontFamily,
            fontSize,
            lineHeight: 1.6,
            padding: `${padX}px`,
            color: OUTPUT,
            minHeight: fontSize * 6,
            whiteSpace: "pre-wrap",
          }}
        >
          {rendered.map((line, i) => {
            const isCmd = lines[i].isCommand;
            const showCursorHere = cursorLineIndex === i && cursorOn;
            return (
              <div key={i} style={{ display: "flex", flexWrap: "wrap" }}>
                <span
                  style={{
                    color: isCmd ? accent : OUTPUT,
                    fontWeight: isCmd ? 700 : 400,
                  }}
                >
                  {line.shown}
                </span>
                {showCursorHere && (
                  <span
                    style={{
                      display: "inline-block",
                      width: charWidth * 0.9,
                      height: fontSize,
                      marginLeft: 2,
                      transform: "translateY(2px)",
                      background: accent,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}
