import { ParseResult } from "@/lib/cat/intentTypes";
import { PipelineDocument } from "@/lib/core/types";

export function summarizeProposal(
  parsed: ParseResult,
  _before: PipelineDocument,
  _after: PipelineDocument
): string {
  if (parsed.intents.length === 0) {
    return "No supported edits were recognized.";
  }

  const parts: string[] = [];
  if (parsed.intents.includes("warm")) parts.push("warmth");
  if (parsed.intents.includes("cool")) parts.push("cooling");
  if (parsed.intents.includes("brighter")) parts.push("brightness");
  if (parsed.intents.includes("darker")) parts.push("darkening");
  if (parsed.intents.includes("contrast_up")) parts.push("contrast");
  if (parsed.intents.includes("soften")) parts.push("softness");
  if (parsed.intents.includes("cinematic")) parts.push("a cinematic tone");
  if (parsed.intents.includes("sepia")) parts.push("a sepia tone");
  if (parsed.intents.includes("mono")) parts.push("a monochrome look");
  if (parsed.intents.includes("sharpen")) parts.push("sharpening");
  if (parsed.intents.includes("vignette")) parts.push("a vignette");
  if (parsed.intents.includes("blend_with_original")) {
    parts.push("blending with the original");
  }

  if (parts.length === 0) return "Applied supported edits to the pipeline.";
  if (parts.length === 1) return `Added ${parts[0]} to the pipeline.`;
  return `Added ${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]} to the pipeline.`;
}
