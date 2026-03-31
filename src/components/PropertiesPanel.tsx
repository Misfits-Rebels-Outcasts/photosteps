"use client";

import { PipelineStep, StepId } from "@/lib/core/types";

interface PropertiesPanelProps {
  pipelineSteps: PipelineStep[];
  selectedStep?: PipelineStep;
  onParamChange: (stepId: StepId, key: string, value: unknown) => void;
  onInputChange: (stepId: StepId, inputId: StepId) => void;
  onBlendInputChange: (
    stepId: StepId,
    key: "imageA" | "imageB" | "mask",
    value: StepId | null
  ) => void;
}

function parseLooseValue(raw: string): unknown {
  const trimmed = raw.trim();
  if (trimmed === "") return "";
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (!Number.isNaN(Number(trimmed)) && trimmed !== "") return Number(trimmed);
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return raw;
    }
  }
  return raw;
}

export function PropertiesPanel({
  pipelineSteps,
  selectedStep,
  onParamChange,
  onInputChange,
  onBlendInputChange,
}: PropertiesPanelProps) {
  const selectedIndex = selectedStep
    ? pipelineSteps.findIndex((step) => step.id === selectedStep.id)
    : -1;
  const referenceCandidates =
    selectedIndex > 0
      ? pipelineSteps.slice(0, selectedIndex)
      : pipelineSteps.filter((step) => step.id !== selectedStep?.id);

  function parseCandidate(raw: string): StepId | undefined {
    const match = referenceCandidates.find((step) => String(step.id) === raw);
    return match?.id;
  }

  return (
    <aside className="flex h-full min-w-0 flex-col border-l border-black/10 bg-white">
      <div className="border-b border-black/10 p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Properties</p>
        <p className="text-sm text-slate-700">
          {selectedStep ? `Edit params for ${selectedStep.node}` : "Select a step"}
        </p>
      </div>

      <div className="flex-1 overflow-auto p-3">
        {!selectedStep ? (
          <p className="text-sm text-slate-500">No selected step.</p>
        ) : (
          <div className="space-y-3">
            {"input" in selectedStep && selectedStep.input !== undefined && selectedStep.node !== "ReadImage" && (
              <label className="block space-y-1">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  input
                </span>
                <select
                  className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900"
                  value={String(selectedStep.input)}
                  onChange={(e) => {
                    const next = parseCandidate(e.target.value);
                    if (next !== undefined) onInputChange(selectedStep.id, next);
                  }}
                >
                  {referenceCandidates.map((step) => (
                    <option key={String(step.id)} value={String(step.id)}>
                      {String(step.id)} · {step.node}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {selectedStep.node === "Blend" && "inputs" in selectedStep && selectedStep.inputs && (
              <>
                {(["imageA", "imageB", "mask"] as const).map((key) => (
                  <label key={key} className="block space-y-1">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {key}
                    </span>
                    <select
                      className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900"
                      value={
                        selectedStep.inputs?.[key] === null
                          ? "__null__"
                          : String(selectedStep.inputs?.[key] ?? "")
                      }
                      onChange={(e) => {
                        if (e.target.value === "__null__") {
                          onBlendInputChange(selectedStep.id, key, null);
                          return;
                        }
                        const next = parseCandidate(e.target.value);
                        if (next !== undefined) onBlendInputChange(selectedStep.id, key, next);
                      }}
                    >
                      {key === "mask" && <option value="__null__">None</option>}
                      {referenceCandidates.map((step) => (
                        <option key={String(step.id)} value={String(step.id)}>
                          {String(step.id)} · {step.node}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </>
            )}

            {Object.entries(selectedStep.params).map(([key, value]) => (
              <label key={key} className="block space-y-1">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {key}
                </span>
                <input
                  className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900"
                  defaultValue={
                    typeof value === "string" || typeof value === "number" || typeof value === "boolean"
                      ? String(value)
                      : JSON.stringify(value)
                  }
                  onBlur={(e) => onParamChange(selectedStep.id, key, parseLooseValue(e.target.value))}
                />
              </label>
            ))}
            {Object.keys(selectedStep.params).length === 0 && (
              <p className="text-sm text-slate-500">This step has no editable params yet.</p>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
