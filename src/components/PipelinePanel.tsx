"use client";

import { useState } from "react";

import { NodePicker } from "@/components/NodePicker";
import { summarizeStep } from "@/lib/core/stepSummary";
import { PipelineDocument, StepId } from "@/lib/core/types";
import { readStepMeta } from "@/lib/pipeline/helpers";

interface PipelinePanelProps {
  pipeline: PipelineDocument;
  selectedStepId?: StepId;
  nodeNames: string[];
  newNode: string;
  onNewNodeChange: (value: string) => void;
  onSelect: (stepId: StepId) => void;
  onAddStep: () => void;
  onMoveUp: (stepId: StepId) => void;
  onMoveDown: (stepId: StepId) => void;
  onToggleEnabled: (stepId: StepId) => void;
  onDuplicate: (stepId: StepId) => void;
  onDelete: (stepId: StepId) => void;
}

export function PipelinePanel({
  pipeline,
  selectedStepId,
  nodeNames,
  newNode,
  onNewNodeChange,
  onSelect,
  onAddStep,
  onMoveUp,
  onMoveDown,
  onToggleEnabled,
  onDuplicate,
  onDelete,
}: PipelinePanelProps) {
  const [openMenuStepId, setOpenMenuStepId] = useState<StepId | undefined>(undefined);

  return (
    <aside className="flex h-full min-w-0 flex-col border-r border-black/10 bg-white">
      <div className="border-b border-black/10 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Pipeline
        </p>
        <NodePicker
          nodeNames={nodeNames}
          value={newNode}
          onChange={onNewNodeChange}
          onAdd={onAddStep}
        />
      </div>

      <div className="flex-1 overflow-auto p-3">
        <ul className="space-y-2">
          {pipeline.steps.map((step, index) => {
            const meta = readStepMeta(step);
            const selected = selectedStepId === step.id;
            const frozen = step.node === "ReadImage" || step.node === "ExportImage";
            const menuOpen = openMenuStepId === step.id;

            return (
              <li
                key={String(step.id)}
                className={`rounded-lg border p-2 ${
                  frozen
                    ? "border-amber-300 bg-amber-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="relative flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() => onSelect(step.id)}
                    className={`w-full rounded-md px-2 py-1 text-left ${
                      selected ? "bg-slate-900 text-white" : "hover:bg-slate-100"
                    }`}
                  >
                    <p className="text-sm font-semibold">
                      {index + 1}. {step.node}
                      {frozen ? " (Mandatory)" : ""}
                    </p>
                    <p className={`text-xs ${selected ? "text-slate-200" : "text-slate-500"}`}>
                      {summarizeStep(step)}
                    </p>
                    <p className={`text-xs ${selected ? "text-slate-300" : "text-slate-400"}`}>
                      id: {String(step.id)} · {meta?.enabled === false ? "disabled" : "enabled"}
                    </p>
                  </button>

                  <button
                    type="button"
                    disabled={frozen}
                    onClick={() => {
                      setOpenMenuStepId(menuOpen ? undefined : step.id);
                    }}
                    className={`min-w-8 rounded-md border px-2 py-1 text-sm font-semibold ${
                      frozen
                        ? "cursor-not-allowed border-amber-300 bg-amber-100 text-amber-500"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                    title={frozen ? "Mandatory node actions are locked" : "Step actions"}
                  >
                    ...
                  </button>

                  {!frozen && menuOpen && (
                    <div className="absolute right-0 top-9 z-10 min-w-36 rounded-md border border-slate-200 bg-white p-1 shadow-lg">
                      <button
                        type="button"
                        onClick={() => {
                          onMoveUp(step.id);
                          setOpenMenuStepId(undefined);
                        }}
                        className="block w-full rounded px-2 py-1 text-left text-xs hover:bg-slate-100"
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onMoveDown(step.id);
                          setOpenMenuStepId(undefined);
                        }}
                        className="block w-full rounded px-2 py-1 text-left text-xs hover:bg-slate-100"
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onToggleEnabled(step.id);
                          setOpenMenuStepId(undefined);
                        }}
                        className="block w-full rounded px-2 py-1 text-left text-xs hover:bg-slate-100"
                      >
                        Toggle
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDuplicate(step.id);
                          setOpenMenuStepId(undefined);
                        }}
                        className="block w-full rounded px-2 py-1 text-left text-xs hover:bg-slate-100"
                      >
                        Duplicate
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDelete(step.id);
                          setOpenMenuStepId(undefined);
                        }}
                        className="block w-full rounded px-2 py-1 text-left text-xs text-rose-700 hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
