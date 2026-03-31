"use client";

import { useEffect, useMemo, useState } from "react";

import { PipelinePanel } from "@/components/PipelinePanel";
import { PropertiesPanel } from "@/components/PropertiesPanel";
import { PromptRegressionPanel } from "@/components/PromptRegressionPanel";
import { TopBar } from "@/components/TopBar";
import { Viewer } from "@/components/Viewer";
import { getDefaultParams } from "@/lib/core/defaultParams";
import { listNodeNames } from "@/lib/core/nodeRegistry";
import { makeCompatibleStepId } from "@/lib/core/ids";
import { PipelineDocument, PipelineStep, StepId } from "@/lib/core/types";
import { decodePipelineFromToken, encodePipelineToToken } from "@/lib/handoff/token";
import examplePipeline from "@/lib/schema/example.pipeline.json";
import {
  deleteStep,
  duplicateStep,
  insertStep,
  moveStep,
  toggleStepEnabled,
  updateBlendInputs,
  updateSingleInput,
  updateStepParams,
} from "@/lib/pipeline/commands";
import { findLastImageStep, findReadImageStep } from "@/lib/pipeline/helpers";
import { normalizePipeline, validateBasicPipelineShape } from "@/lib/pipeline/normalize";

type StepDraft = {
  node: string;
  params: Record<string, unknown>;
  metadata: { createdBy: "user"; enabled: boolean; intent: string };
  input?: StepId;
  inputs?: Record<string, StepId | null>;
};

type CatSuccess = {
  ok: true;
  summary: string;
  notes: string[];
  handoffUrl?: string;
  warnings: string[];
  proposedPipeline: PipelineDocument;
};

type CatFailure = {
  ok: false;
  warnings?: string[];
  error?: { message?: string };
};

type RegressionResult = {
  prompt: string;
  ok: boolean;
  summary: string;
  warnings: string[];
};

const REGRESSION_PROMPTS = [
  "make it warmer",
  "make it dreamy",
  "blend with original",
  "add a cinematic look",
  "sharpen slightly after blur",
];

const DEFAULT_READ_SOURCE = "portrait.jpg";
const DEFAULT_IMAGE_URL = "/images/mona-lisa-default.jpeg";
const DEFAULT_IMAGE_SOURCES: Record<string, string> = {
  [DEFAULT_READ_SOURCE]: DEFAULT_IMAGE_URL,
  "mona-lisa-default.jpeg": DEFAULT_IMAGE_URL,
  "Mona_Lisa_by_Leonardo_da_Vinci.jpeg": DEFAULT_IMAGE_URL,
};

function cloneExample(): PipelineDocument {
  return JSON.parse(JSON.stringify(examplePipeline)) as PipelineDocument;
}

function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function buildNewStepDraft(pipeline: PipelineDocument, node: string): StepDraft {
  const currentSource = findLastImageStep(pipeline)?.id;

  if (node === "ReadImage") {
    return {
      node,
      params: {
        source: DEFAULT_READ_SOURCE,
        ...getDefaultParams(node),
      },
      metadata: { createdBy: "user", enabled: true, intent: "added manually" },
    };
  }

  if (node === "Blend") {
    const read = findReadImageStep(pipeline);
    return {
      node,
      inputs: {
        imageA: read?.id ?? currentSource ?? 1,
        imageB: currentSource ?? read?.id ?? 1,
        mask: null,
      },
      params: {
        mode: "softLight",
        opacity: 0.35,
        ...getDefaultParams(node),
      },
      metadata: { createdBy: "user", enabled: true, intent: "added manually" },
    };
  }

  return {
    node,
    input: currentSource,
    params: getDefaultParams(node),
    metadata: { createdBy: "user", enabled: true, intent: "added manually" },
  };
}

export function PhotoStepsApp() {
  const nodeNames = useMemo(() => listNodeNames(), []);
  const [pipeline, setPipeline] = useState<PipelineDocument>(() =>
    normalizePipeline(cloneExample())
  );
  const [selectedStepId, setSelectedStepId] = useState<StepId | undefined>(() => {
    return cloneExample().steps[0]?.id;
  });
  const [newNode, setNewNode] = useState<string>(nodeNames[0] ?? "Adjust");
  const [instruction, setInstruction] = useState<string>(
    "make this warmer and softer but keep the original"
  );
  const [busy, setBusy] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [lastSummary, setLastSummary] = useState<string>("");
  const [imageSources, setImageSources] = useState<Record<string, string>>(DEFAULT_IMAGE_SOURCES);
  const [handoffUrl, setHandoffUrl] = useState<string>("");
  const [regressionRunning, setRegressionRunning] = useState(false);
  const [regressionResults, setRegressionResults] = useState<RegressionResult[]>([]);

  const selectedStep = pipeline.steps.find((step) => step.id === selectedStepId);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("p");
    const imageUrl = params.get("img");
    if (!token) return;
    try {
      const imported = normalizePipeline(decodePipelineFromToken(token));
      setPipeline(imported);
      setSelectedStepId(imported.steps[0]?.id);
      setWarnings(validateBasicPipelineShape(imported));
      setNotes(["Loaded pipeline from handoff link."]);
      setLastSummary("Handoff import complete.");

      if (imageUrl) {
        const read = findReadImageStep(imported);
        if (read && typeof read.params.source === "string" && read.params.source) {
          setImageSources((prev) => ({ ...prev, [read.params.source as string]: imageUrl }));
        } else {
          const fallbackSource = "handoff-image";
          setImageSources((prev) => ({ ...prev, [fallbackSource]: imageUrl }));
          if (read) {
            setPipeline((current) =>
              updateStepParams(current, read.id, { source: fallbackSource })
            );
          }
        }
      }
    } catch (error) {
      setWarnings([
        `Failed to import handoff token: ${error instanceof Error ? error.message : String(error)}`,
      ]);
    }
  }, []);

  function apply(next: PipelineDocument) {
    const normalized = normalizePipeline(next);
    setPipeline(normalized);
    setWarnings(validateBasicPipelineShape(normalized));
    if (!normalized.steps.some((s) => s.id === selectedStepId)) {
      setSelectedStepId(normalized.steps[0]?.id);
    }
  }

  function handleAddStep() {
    const draft = buildNewStepDraft(pipeline, newNode);
    const id = makeCompatibleStepId(pipeline, newNode.toLowerCase());
    const next = insertStep(pipeline, { ...draft, id });
    apply(next);
    setSelectedStepId(id);
  }

  async function callCat(instructionText: string, sourcePipeline: PipelineDocument) {
    const read = findReadImageStep(sourcePipeline);
    const source = read && typeof read.params.source === "string" ? read.params.source : "";
    const candidateImageUrl = source ? imageSources[source] : undefined;
    const remoteImageUrl =
      candidateImageUrl && /^https?:\/\//.test(candidateImageUrl) ? candidateImageUrl : undefined;

    const response = await fetch("/api/photostep", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instruction: instructionText,
        pipeline: sourcePipeline,
        imageUrl: remoteImageUrl,
        selection: selectedStepId ? { selectedStepId } : undefined,
        options: {
          preferReuseExistingSteps: true,
          allowBranching: true,
        },
      }),
    });
    const data = (await response.json()) as CatSuccess | CatFailure;
    return { response, data };
  }

  async function handleApplyCat() {
    setBusy(true);
    try {
      const { response, data } = await callCat(instruction, pipeline);

      if (!response.ok) {
        const errData = data as CatFailure;
        setWarnings(errData.warnings ?? [errData.error?.message ?? "CAT proposal failed"]);
        setNotes([]);
        return;
      }

      if (!data.ok) {
        setWarnings(data.warnings ?? [data.error?.message ?? "CAT proposal failed"]);
        setNotes([]);
        return;
      }

      setLastSummary(data.summary);
      setHandoffUrl(data.handoffUrl ?? "");
      setNotes(data.notes ?? []);
      setWarnings(data.warnings ?? []);
      setPipeline(data.proposedPipeline);
      setSelectedStepId(data.proposedPipeline.steps[data.proposedPipeline.steps.length - 1]?.id);
    } finally {
      setBusy(false);
    }
  }

  async function runRegressionPrompt(prompt: string) {
    const { response, data } = await callCat(prompt, pipeline);
    if (!response.ok || !data.ok) {
      const err = data as CatFailure;
      const result: RegressionResult = {
        prompt,
        ok: false,
        summary: err.error?.message ?? "Request failed",
        warnings: err.warnings ?? [],
      };
      setRegressionResults((prev) => [result, ...prev.filter((r) => r.prompt !== prompt)]);
      return;
    }
    const result: RegressionResult = {
      prompt,
      ok: true,
      summary: data.summary,
      warnings: data.warnings ?? [],
    };
    setRegressionResults((prev) => [result, ...prev.filter((r) => r.prompt !== prompt)]);
  }

  async function runAllRegressions() {
    setRegressionRunning(true);
    setRegressionResults([]);
    try {
      for (const prompt of REGRESSION_PROMPTS) {
        // Run against the same current pipeline snapshot for deterministic comparisons.
        const snapshot = JSON.parse(JSON.stringify(pipeline)) as PipelineDocument;
        const { response, data } = await callCat(prompt, snapshot);
        if (!response.ok || !data.ok) {
          const err = data as CatFailure;
          setRegressionResults((prev) => [
            ...prev,
            {
              prompt,
              ok: false,
              summary: err.error?.message ?? "Request failed",
              warnings: err.warnings ?? [],
            },
          ]);
          continue;
        }
        setRegressionResults((prev) => [
          ...prev,
          {
            prompt,
            ok: true,
            summary: data.summary,
            warnings: data.warnings ?? [],
          },
        ]);
      }
    } finally {
      setRegressionRunning(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <TopBar
        instruction={instruction}
        onInstructionChange={setInstruction}
        onApplyCat={handleApplyCat}
        onCopyHandoffLink={async () => {
          const token = encodePipelineToToken(pipeline);
          const params = new URLSearchParams({ p: token });
          const read = findReadImageStep(pipeline);
          const source = read && typeof read.params.source === "string" ? read.params.source : "";
          const imageUrl = source ? imageSources[source] : undefined;
          if (imageUrl && /^https?:\/\//.test(imageUrl)) {
            params.set("img", imageUrl);
          }
          const link = `${window.location.origin}/studio?${params.toString()}`;
          await navigator.clipboard.writeText(link);
          setHandoffUrl(link);
          setLastSummary("Copied handoff link.");
        }}
        onResetExample={() => {
          const reset = normalizePipeline(cloneExample());
          setPipeline(reset);
          setSelectedStepId(reset.steps[0]?.id);
          setWarnings([]);
          setNotes([]);
          setHandoffUrl("");
          setLastSummary("");
          setImageSources(DEFAULT_IMAGE_SOURCES);
        }}
        onSavePipeline={() => {
          downloadTextFile("photosteps.pipeline.json", JSON.stringify(pipeline, null, 2));
          setWarnings([]);
          setNotes([]);
        }}
        onOpenPipeline={async (file) => {
          try {
            const text = await file.text();
            const parsed = JSON.parse(text) as PipelineDocument;
            const normalized = normalizePipeline(parsed);
            setPipeline(normalized);
            setSelectedStepId(normalized.steps[0]?.id);
            setWarnings(validateBasicPipelineShape(normalized));
            setNotes([]);
            setHandoffUrl("");
            setLastSummary(`Opened pipeline: ${file.name}`);
          } catch (error) {
            setWarnings([
              `Failed to open pipeline: ${
                error instanceof Error ? error.message : String(error)
              }`,
            ]);
            setNotes([]);
          }
        }}
        busy={busy}
      />

      <PromptRegressionPanel
        prompts={REGRESSION_PROMPTS}
        running={regressionRunning}
        results={regressionResults}
        onRunPrompt={(prompt) => {
          setInstruction(prompt);
          void runRegressionPrompt(prompt);
        }}
        onRunAll={() => {
          void runAllRegressions();
        }}
      />

      {(warnings.length > 0 || notes.length > 0 || lastSummary) && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
          {lastSummary && <p className="font-medium">{lastSummary}</p>}
          {handoffUrl && (
            <p className="break-all">
              Handoff: <a className="underline" href={handoffUrl}>{handoffUrl}</a>
            </p>
          )}
          {notes.map((note) => (
            <p key={note}>{note}</p>
          ))}
          {warnings.map((w) => (
            <p key={w}>{w}</p>
          ))}
        </div>
      )}

      <main className="grid flex-1 grid-cols-1 md:grid-cols-[340px_1fr_340px]">
        <PipelinePanel
          pipeline={pipeline}
          selectedStepId={selectedStepId}
          nodeNames={nodeNames}
          newNode={newNode}
          onNewNodeChange={setNewNode}
          onAddStep={handleAddStep}
          onSelect={setSelectedStepId}
          onMoveUp={(id) => {
            const index = pipeline.steps.findIndex((s) => s.id === id);
            if (index <= 0) return;
            apply(moveStep(pipeline, id, index - 1));
          }}
          onMoveDown={(id) => {
            const index = pipeline.steps.findIndex((s) => s.id === id);
            if (index < 0 || index >= pipeline.steps.length - 1) return;
            apply(moveStep(pipeline, id, index + 1));
          }}
          onToggleEnabled={(id) => apply(toggleStepEnabled(pipeline, id))}
          onDuplicate={(id) => apply(duplicateStep(pipeline, id))}
          onDelete={(id) => apply(deleteStep(pipeline, id))}
        />

        <Viewer
          pipeline={pipeline}
          selectedStep={selectedStep}
          imageSources={imageSources}
          onExportPreview={(canvas) => {
            canvas.toBlob((blob) => {
              if (!blob) {
                setWarnings(["Export failed: no canvas data available."]);
                return;
              }
              const url = URL.createObjectURL(blob);
              const anchor = document.createElement("a");
              anchor.href = url;
              anchor.download = "photosteps-preview.png";
              document.body.appendChild(anchor);
              anchor.click();
              anchor.remove();
              URL.revokeObjectURL(url);
              setWarnings([]);
              setLastSummary("Exported preview as PNG.");
            }, "image/png");
          }}
          onImportImage={(file) => {
            const objectUrl = URL.createObjectURL(file);
            setImageSources((prev) => ({
              ...prev,
              [file.name]: objectUrl,
            }));
            const read = findReadImageStep(pipeline);
            if (read) {
              apply(updateStepParams(pipeline, read.id, { source: file.name }));
              setSelectedStepId(read.id);
            }
          }}
        />

        <PropertiesPanel
          pipelineSteps={pipeline.steps}
          selectedStep={selectedStep}
          onParamChange={(stepId, key, value) => {
            apply(updateStepParams(pipeline, stepId, { [key]: value }));
          }}
          onInputChange={(stepId, inputId) => {
            apply(updateSingleInput(pipeline, stepId, inputId));
          }}
          onBlendInputChange={(stepId, key, value) => {
            apply(updateBlendInputs(pipeline, stepId, { [key]: value }));
          }}
        />
      </main>
    </div>
  );
}
