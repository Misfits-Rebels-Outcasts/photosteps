import { PipelineDocument, StepId } from "@/lib/core/types";
import {
  findExportImageStep,
  findLastImageStep,
  findStepById,
  readStepMeta,
} from "@/lib/pipeline/helpers";

export function findInsertionIndex(pipeline: PipelineDocument): number {
  const exportStep = findExportImageStep(pipeline);
  if (exportStep) {
    const exportIndex = pipeline.steps.findIndex((s) => s.id === exportStep.id);
    if (exportIndex >= 0) return exportIndex;
  }

  return pipeline.steps.length;
}

export function findCurrentSourceId(pipeline: PipelineDocument): string | number | undefined {
  return findLastImageStep(pipeline)?.id;
}

export function findCurrentSourceIdWithAnchor(
  pipeline: PipelineDocument,
  anchorStepId?: StepId
): string | number | undefined {
  if (anchorStepId === undefined || anchorStepId === null) {
    return findCurrentSourceId(pipeline);
  }
  const step = findStepById(pipeline, anchorStepId);
  if (!step) return findCurrentSourceId(pipeline);
  if (readStepMeta(step)?.enabled === false) return findCurrentSourceId(pipeline);
  return step.id;
}
