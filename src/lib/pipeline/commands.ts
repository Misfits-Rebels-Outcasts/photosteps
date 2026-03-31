import { makeCompatibleStepId } from "@/lib/core/ids";
import { PipelineDocument, PipelineStep, StepId } from "@/lib/core/types";
import { clonePipeline, normalizeStepMeta } from "@/lib/pipeline/helpers";

function findStepIndex(pipeline: PipelineDocument, stepId: StepId): number {
  return pipeline.steps.findIndex((s) => s.id === stepId);
}

export function insertStep(
  pipeline: PipelineDocument,
  step: Omit<PipelineStep, "id"> & { id?: StepId },
  index?: number
): PipelineDocument {
  const next = clonePipeline(pipeline);
  const inserted: PipelineStep = {
    ...step,
    id: step.id ?? makeCompatibleStepId(next, step.node.toLowerCase()),
  };
  normalizeStepMeta(inserted);

  if (index === undefined || index < 0 || index > next.steps.length) {
    next.steps.push(inserted);
  } else {
    next.steps.splice(index, 0, inserted);
  }

  return next;
}

export function deleteStep(
  pipeline: PipelineDocument,
  stepId: StepId
): PipelineDocument {
  const next = clonePipeline(pipeline);
  next.steps = next.steps.filter((s) => s.id !== stepId);
  return next;
}

export function updateStepParams(
  pipeline: PipelineDocument,
  stepId: StepId,
  paramsPatch: Record<string, unknown>
): PipelineDocument {
  const next = clonePipeline(pipeline);
  const index = findStepIndex(next, stepId);
  if (index < 0) return next;
  next.steps[index].params = {
    ...next.steps[index].params,
    ...paramsPatch,
  };
  return next;
}

export function moveStep(
  pipeline: PipelineDocument,
  stepId: StepId,
  toIndex: number
): PipelineDocument {
  const next = clonePipeline(pipeline);
  const fromIndex = findStepIndex(next, stepId);
  if (fromIndex < 0) return next;

  const boundedTo = Math.max(0, Math.min(toIndex, next.steps.length - 1));
  const [step] = next.steps.splice(fromIndex, 1);
  next.steps.splice(boundedTo, 0, step);
  return next;
}

export function toggleStepEnabled(
  pipeline: PipelineDocument,
  stepId: StepId,
  enabled?: boolean
): PipelineDocument {
  const next = clonePipeline(pipeline);
  const index = findStepIndex(next, stepId);
  if (index < 0) return next;

  const step = next.steps[index];
  normalizeStepMeta(step);
  const current = step.metadata ?? step.meta ?? { enabled: true };
  const nextEnabled = enabled ?? !(current.enabled ?? true);
  step.metadata = { ...current, enabled: nextEnabled };
  delete step.meta;

  return next;
}

export function duplicateStep(
  pipeline: PipelineDocument,
  stepId: StepId
): PipelineDocument {
  const next = clonePipeline(pipeline);
  const index = findStepIndex(next, stepId);
  if (index < 0) return next;

  const original = next.steps[index];
  const duplicated: PipelineStep = {
    ...original,
    id: makeCompatibleStepId(next, original.node.toLowerCase()),
    params: { ...original.params },
  };
  normalizeStepMeta(duplicated);

  next.steps.splice(index + 1, 0, duplicated);
  return next;
}

export function updateSingleInput(
  pipeline: PipelineDocument,
  stepId: StepId,
  input: StepId
): PipelineDocument {
  const next = clonePipeline(pipeline);
  const index = findStepIndex(next, stepId);
  if (index < 0) return next;
  const step = next.steps[index];
  if (!("input" in step)) return next;
  step.input = input;
  return next;
}

export function updateBlendInputs(
  pipeline: PipelineDocument,
  stepId: StepId,
  patch: Record<string, StepId | null>
): PipelineDocument {
  const next = clonePipeline(pipeline);
  const index = findStepIndex(next, stepId);
  if (index < 0) return next;
  const step = next.steps[index];
  if (!("inputs" in step)) return next;
  step.inputs = {
    ...(step.inputs ?? {}),
    ...patch,
  };
  return next;
}
