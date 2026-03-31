import { PipelineDocument } from "@/lib/core/types";
import {
  findExportImageStep,
  findLastImageStep,
  normalizeStepMeta,
} from "@/lib/pipeline/helpers";

export function normalizePipeline(pipeline: PipelineDocument): PipelineDocument {
  const steps = [...pipeline.steps];

  for (const step of steps) {
    normalizeStepMeta(step);
  }

  const exportIndex = steps.findIndex((s) => s.node === "ExportImage");
  if (exportIndex >= 0 && exportIndex !== steps.length - 1) {
    const [exportStep] = steps.splice(exportIndex, 1);
    steps.push(exportStep);
  }

  const normalized: PipelineDocument = {
    ...pipeline,
    steps,
  };

  const exportStep = findExportImageStep(normalized);
  const lastImageStep = findLastImageStep({
    ...normalized,
    steps: normalized.steps.filter((s) => s.node !== "ExportImage"),
  });

  if (exportStep && lastImageStep && "input" in exportStep) {
    exportStep.input = lastImageStep.id;
  }

  return normalized;
}

export function validateBasicPipelineShape(
  pipeline: PipelineDocument
): string[] {
  const warnings: string[] = [];

  const readCount = pipeline.steps.filter((s) => s.node === "ReadImage").length;
  if (readCount === 0) warnings.push("Pipeline has no ReadImage step.");
  if (readCount > 1) warnings.push("Pipeline has multiple ReadImage steps.");

  const exportCount = pipeline.steps.filter((s) => s.node === "ExportImage").length;
  if (exportCount === 0) warnings.push("Pipeline has no ExportImage step.");
  if (exportCount > 1) warnings.push("Pipeline has multiple ExportImage steps.");

  return warnings;
}
