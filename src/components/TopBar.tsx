"use client";

interface TopBarProps {
  instruction: string;
  onInstructionChange: (value: string) => void;
  onApplyCat: () => void;
  onCopyHandoffLink: () => void;
  onResetExample: () => void;
  onSavePipeline: () => void;
  onOpenPipeline: (file: File) => void;
  busy?: boolean;
}

export function TopBar({
  instruction,
  onInstructionChange,
  onApplyCat,
  onCopyHandoffLink,
  onResetExample,
  onSavePipeline,
  onOpenPipeline,
  busy = false,
}: TopBarProps) {
  return (
    <header className="border-b border-black/10 bg-white/90 px-4 py-3 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center gap-3">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900">PhotoSteps</h1>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
          Phase 2 Shell
        </span>
        <div className="ml-auto flex min-w-[320px] flex-1 items-center gap-2">
          <input
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-500"
            placeholder="Try: make it warmer and softer but keep the original"
            value={instruction}
            onChange={(e) => onInstructionChange(e.target.value)}
          />
          <button
            type="button"
            onClick={onApplyCat}
            disabled={busy}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Applying..." : "Apply CAT"}
          </button>
          <button
            type="button"
            onClick={onCopyHandoffLink}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Copy Handoff Link
          </button>
          <button
            type="button"
            onClick={onResetExample}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Reset Example
          </button>
          <button
            type="button"
            onClick={onSavePipeline}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Save Pipeline
          </button>
          <label className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
            Open Pipeline
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onOpenPipeline(file);
                e.currentTarget.value = "";
              }}
            />
          </label>
        </div>
      </div>
    </header>
  );
}
