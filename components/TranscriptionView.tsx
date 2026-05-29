"use client";

import { useState } from "react";
import { Clock, Edit3, Check, X } from "lucide-react";
import { TranscriptionSegment } from "@/lib/whisper";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TranscriptionViewProps {
  segments: TranscriptionSegment[];
  language: string;
  duration: number;
  onSegmentsChange: (segments: TranscriptionSegment[]) => void;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 10);
  return `${m}:${String(s).padStart(2, "0")}.${ms}`;
}

function SegmentRow({
  segment,
  index,
  onUpdate,
}: {
  segment: TranscriptionSegment;
  index: number;
  onUpdate: (updated: TranscriptionSegment) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(segment.text);

  const save = () => {
    onUpdate({ ...segment, text: draft.trim() });
    setEditing(false);
  };

  const cancel = () => {
    setDraft(segment.text);
    setEditing(false);
  };

  return (
    <div
      className={cn(
        "group flex gap-3 p-3 rounded-lg border transition-colors",
        editing
          ? "border-[#00c4f0]/30 bg-[#00c4f0]/4"
          : "border-transparent hover:border-white/6 hover:bg-white/2"
      )}
    >
      <div className="flex-shrink-0 pt-0.5">
        <span className="text-xs font-mono text-white/25 w-6 inline-block text-right">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0 pt-0.5">
        <Clock className="h-3 w-3 text-white/20" />
        <span className="text-xs font-mono text-white/35">{formatTime(segment.start)}</span>
        <span className="text-xs text-white/15">→</span>
        <span className="text-xs font-mono text-white/35">{formatTime(segment.end)}</span>
      </div>

      <div className="flex-1 min-w-0">
        {editing ? (
          <textarea
            className="w-full bg-transparent text-sm text-white border-none outline-none resize-none leading-relaxed"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={Math.ceil(draft.length / 60) || 1}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); save(); }
              if (e.key === "Escape") cancel();
            }}
          />
        ) : (
          <p className="text-sm text-white/80 leading-relaxed">{segment.text}</p>
        )}
      </div>

      <div className="flex-shrink-0 flex items-start gap-1 pt-0.5">
        {editing ? (
          <>
            <button
              onClick={save}
              className="p-1 rounded hover:bg-emerald-400/10 text-emerald-400 transition-colors"
              title="Salvar"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={cancel}
              className="p-1 rounded hover:bg-red-400/10 text-red-400 transition-colors"
              title="Cancelar"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="p-1 rounded hover:bg-white/5 text-white/20 hover:text-white/60 transition-colors opacity-0 group-hover:opacity-100"
            title="Editar"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export function TranscriptionView({
  segments,
  language,
  duration,
  onSegmentsChange,
}: TranscriptionViewProps) {
  const updateSegment = (index: number, updated: TranscriptionSegment) => {
    const next = [...segments];
    next[index] = updated;
    onSegmentsChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="default">{segments.length} segmentos</Badge>
        <Badge variant="secondary">{language.toUpperCase()}</Badge>
        <Badge variant="secondary">{formatTime(duration)}</Badge>
        <span className="text-xs text-white/30 ml-auto">Clique no ícone para editar</span>
      </div>

      <div className="max-h-96 overflow-y-auto pr-1 space-y-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {segments.map((seg, i) => (
          <SegmentRow
            key={seg.id}
            segment={seg}
            index={i}
            onUpdate={(updated) => updateSegment(i, updated)}
          />
        ))}
      </div>
    </div>
  );
}
