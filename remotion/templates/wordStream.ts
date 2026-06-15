// Utilidades compartilhadas entre os templates de caption.
// Todos derivam o texto de `title` + `subtitle` e distribuem as palavras ao
// longo de `durationInFrames` — mantendo o resultado determinístico por frame.

export function splitWords(title?: string, subtitle?: string): string[] {
  return `${title ?? ""} ${subtitle ?? ""}`.split(/\s+/).filter(Boolean);
}

// Frames que cada palavra ocupa quando exibida uma por vez.
export function perWordSlot(count: number, durationInFrames: number, min = 6): number {
  return Math.max(min, Math.floor(durationInFrames / Math.max(1, count)));
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// Heurística determinística de tamanho de fonte para caber numa largura.
// `perChar` ~ largura média de caractere relativa ao fontSize (depende da fonte).
export function fitFontSize(
  text: string,
  maxWidth: number,
  base: number,
  perChar = 0.5,
): number {
  const needed = maxWidth / Math.max(1, text.length * perChar);
  return Math.max(Math.floor(base * 0.42), Math.min(base, Math.floor(needed)));
}

// PRNG determinístico (mulberry32) — usado no scramble do MatrixDecode.
export function seededChar(seed: number, charset: string): string {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), 1 | t);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  const r = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return charset[Math.floor(r * charset.length)];
}
