import { PipelineDocument, StepId } from "@/lib/core/types";

let counter = 0;

export function makeStepId(prefix: string): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}`;
}

export function makeCompatibleStepId(
  pipeline: Pick<PipelineDocument, "steps">,
  prefix: string
): StepId {
  const hasStringId = pipeline.steps.some((s) => typeof s.id === "string");
  if (hasStringId) return makeStepId(prefix);

  let maxNumeric = 0;
  for (const step of pipeline.steps) {
    if (typeof step.id === "number") {
      maxNumeric = Math.max(maxNumeric, step.id);
    }
  }
  return maxNumeric + 1;
}
