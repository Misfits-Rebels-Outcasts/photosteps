"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { summarizeStep } from "@/lib/core/stepSummary";
import { PipelineDocument, PipelineStep } from "@/lib/core/types";
import { renderPipelineToCanvas } from "@/lib/renderer-webgpu/renderer";

interface ViewerProps {
  pipeline: PipelineDocument;
  selectedStep?: PipelineStep;
  imageSources: Record<string, string>;
  onImportImage: (file: File) => void;
  onExportPreview: (canvas: HTMLCanvasElement) => void;
}

export function Viewer({
  pipeline,
  selectedStep,
  imageSources,
  onImportImage,
  onExportPreview,
}: ViewerProps) {
  const previewRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<string>("No preview yet.");
  const [renderWarnings, setRenderWarnings] = useState<string[]>([]);

  const imageMap = useMemo(() => imageSources, [imageSources]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setStatus("Rendering preview...");
      const result = await renderPipelineToCanvas(pipeline, {
        resolveImageUrl: (source) => {
          if (imageMap[source]) return imageMap[source];
          if (/^(blob:|data:|https?:\/\/|\/)/.test(source)) return source;
          return undefined;
        },
      });

      if (cancelled) return;

      setRenderWarnings(result.warnings);
      if (!result.output || !previewRef.current) {
        setStatus("Preview unavailable. Import an image for ReadImage first.");
        return;
      }

      const canvas = previewRef.current;
      canvas.width = result.output.width;
      canvas.height = result.output.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setStatus("Preview context unavailable.");
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(result.output, 0, 0);
      setStatus(`Preview ${result.output.width}x${result.output.height}`);
    }

    run().catch((error) => {
      if (cancelled) return;
      setStatus(`Render error: ${error instanceof Error ? error.message : String(error)}`);
    });

    return () => {
      cancelled = true;
    };
  }, [pipeline, imageMap]);

  return (
    <section className="flex h-full min-w-0 flex-col bg-gradient-to-br from-slate-100 via-slate-50 to-amber-50">
      <div className="border-b border-black/10 p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Viewer</p>
        <p className="text-sm text-slate-700">
          {selectedStep ? `Selected: ${selectedStep.node}` : "Select a step to preview metadata"}
        </p>
        <p className="mt-1 text-xs text-slate-500">{status}</p>
        <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100">
          Import Image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImportImage(file);
              e.currentTarget.value = "";
            }}
          />
        </label>
        <button
          type="button"
          className="ml-2 mt-2 inline-flex rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
          onClick={() => {
            if (previewRef.current) onExportPreview(previewRef.current);
          }}
        >
          Export PNG
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-2xl rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-slate-400">Pipeline Preview</p>
          <div className="mt-3 overflow-auto rounded-lg border border-slate-200 bg-slate-900/95 p-2">
            <canvas ref={previewRef} className="mx-auto h-auto max-h-[520px] w-auto max-w-full" />
          </div>
          {renderWarnings.length > 0 && (
            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
              {renderWarnings.map((warning) => (
                <p key={warning}>{warning}</p>
              ))}
            </div>
          )}

          {selectedStep ? (
            <>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">{selectedStep.node}</h2>
              <p className="mt-1 text-sm text-slate-600">{summarizeStep(selectedStep)}</p>
              <pre className="mt-4 overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
                {JSON.stringify(selectedStep.params, null, 2)}
              </pre>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-600">Select a step to inspect its params.</p>
          )}
        </div>
      </div>
    </section>
  );
}
