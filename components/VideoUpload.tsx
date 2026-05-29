"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, Film, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoUploadProps {
  onUpload: (file: File) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo"];
const MAX_SIZE_MB = 500;

export function VideoUpload({ onUpload, disabled }: VideoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ name: string; size: string } | null>(null);

  const validateAndUpload = useCallback(
    (file: File) => {
      setError(null);
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Formato inválido. Use MP4, MOV ou AVI.");
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`Arquivo muito grande. Máximo ${MAX_SIZE_MB}MB.`);
        return;
      }
      setPreview({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
      });
      onUpload(file);
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) validateAndUpload(file);
    },
    [validateAndUpload]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateAndUpload(file);
    },
    [validateAndUpload]
  );

  return (
    <div className="w-full">
      <div
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-64 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200",
          dragging
            ? "border-[#00c4f0] bg-[#00c4f0]/5 scale-[1.01]"
            : "border-white/10 bg-white/2 hover:border-white/20 hover:bg-white/4",
          disabled && "cursor-not-allowed opacity-50"
        )}
        onClick={() => { if (!disabled) inputRef.current?.click(); }}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={disabled ? undefined : handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".mp4,.mov,.avi,video/mp4,video/quicktime,video/x-msvideo"
          className="hidden"
          onChange={handleChange}
          disabled={disabled}
        />

        {preview ? (
          <div className="flex flex-col items-center gap-3 text-center px-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#00c4f0]/10 border border-[#00c4f0]/20">
              <Film className="h-6 w-6 text-[#00c4f0]" />
            </div>
            <div>
              <p className="text-sm font-medium text-white truncate max-w-[280px]">{preview.name}</p>
              <p className="text-xs text-white/40 mt-0.5">{preview.size}</p>
            </div>
            <p className="text-xs text-white/30">Clique ou arraste para trocar</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center px-6">
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-xl border transition-colors",
                dragging
                  ? "bg-[#00c4f0]/15 border-[#00c4f0]/30"
                  : "bg-white/4 border-white/8"
              )}
            >
              <Upload className={cn("h-6 w-6", dragging ? "text-[#00c4f0]" : "text-white/40")} />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">
                {dragging ? "Solte o arquivo aqui" : "Arraste o vídeo ou clique para selecionar"}
              </p>
              <p className="text-xs text-white/30 mt-1">MP4, MOV, AVI • até {MAX_SIZE_MB}MB</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <X className="h-3.5 w-3.5 text-red-400 shrink-0" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
