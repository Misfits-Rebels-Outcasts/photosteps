import { PipelineDocument, PipelineStep, StepMeta, StepId } from "@/lib/core/types";

export function clonePipeline(pipeline: PipelineDocument): PipelineDocument {
  return JSON.parse(JSON.stringify(pipeline)) as PipelineDocument;
}

export function readStepMeta(step: PipelineStep): StepMeta | undefined {
  return step.meta ?? step.metadata;
}

export function writeStepMeta(step: PipelineStep, meta: StepMeta): void {
  step.metadata = meta;
  delete step.meta;
}

export function normalizeStepMeta(step: PipelineStep): void {
  const current = readStepMeta(step);
  writeStepMeta(step, {
    enabled: true,
    ...current,
  });
}

export function getEnabledSteps(pipeline: PipelineDocument): PipelineStep[] {
  return pipeline.steps.filter((s) => readStepMeta(s)?.enabled !== false);
}

export function findStepById(
  pipeline: PipelineDocument,
  stepId?: StepId
): PipelineStep | undefined {
  if (stepId === undefined || stepId === null) return undefined;
  return pipeline.steps.find((s) => s.id === stepId);
}

export function findLastImageStep(
  pipeline: PipelineDocument
): PipelineStep | undefined {
  const enabled = getEnabledSteps(pipeline);
  for (let i = enabled.length - 1; i >= 0; i -= 1) {
    if (enabled[i].node !== "ExportImage") return enabled[i];
  }
  return undefined;
}

export function findReadImageStep(
  pipeline: PipelineDocument
): PipelineStep | undefined {
  return pipeline.steps.find((s) => s.node === "ReadImage");
}

export function findExportImageStep(
  pipeline: PipelineDocument
): PipelineStep | undefined {
  return pipeline.steps.find((s) => s.node === "ExportImage");
}

export function findReusableStep(
  pipeline: PipelineDocument,
  nodeName: string
): PipelineStep | undefined {
  const enabled = getEnabledSteps(pipeline);
  for (let i = enabled.length - 1; i >= 0; i -= 1) {
    if (enabled[i].node === nodeName) return enabled[i];
  }
  return undefined;
}

export function isBlendStep(step: PipelineStep): boolean {
  return step.node === "Blend";
}

export function stepUsesId(step: PipelineStep, targetId: StepId): boolean {
  if ("input" in step && step.input === targetId) return true;
  if ("inputs" in step && step.inputs) {
    return Object.values(step.inputs).some((v) => v === targetId);
  }
  return false;
}
