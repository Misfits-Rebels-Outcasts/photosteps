import { compileIntent } from "@/lib/cat/compileIntent";
import { parseInstruction } from "@/lib/cat/parseInstruction";
import { summarizeProposal } from "@/lib/cat/summarizeProposal";
import { PhotoStepRequest } from "@/lib/core/types";
import { normalizePipeline, validateBasicPipelineShape } from "@/lib/pipeline/normalize";

function buildProposalNotes(request: PhotoStepRequest, warnings: string[]): string[] {
  const notes: string[] = [];
  if (request.selection?.selectedStepId !== undefined) {
    notes.push(`Anchored proposal near selected step: ${String(request.selection.selectedStepId)}.`);
  } else {
    notes.push("Anchored proposal at the latest enabled image step.");
  }
  if (request.options?.preferReuseExistingSteps ?? true) {
    notes.push("Reused compatible existing steps when possible.");
  } else {
    notes.push("Preferred appending new steps over reusing existing steps.");
  }
  if (warnings.length > 0) {
    notes.push("Pipeline warnings were detected; review before accepting.");
  }
  return notes;
}

export function proposePipeline(request: PhotoStepRequest) {
  const parsed = parseInstruction(request.instruction);
  const proposed = normalizePipeline(
    compileIntent(parsed, request.pipeline, {
      preferReuseExistingSteps: request.options?.preferReuseExistingSteps ?? true,
      allowBranching: request.options?.allowBranching ?? true,
      anchorStepId: request.selection?.selectedStepId,
    })
  );
  const warnings = validateBasicPipelineShape(proposed);
  const notes = buildProposalNotes(request, warnings);

  return {
    parsed,
    proposed,
    summary: summarizeProposal(parsed, request.pipeline, proposed),
    warnings,
    notes,
  };
}
