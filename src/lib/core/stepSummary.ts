import { PipelineStep } from "@/lib/core/types";

export function summarizeStep(step: PipelineStep): string {
  const label = step.meta?.label ?? step.metadata?.label;
  if (label) return label;

  switch (step.node) {
    case "ReadImage":
      return "Load image";
    case "Adjust":
      return "Adjust tone and color";
    case "Blur":
      return "Apply blur";
    case "ColorTone":
      return "Apply tone style";
    case "Vignette":
      return "Darken or lighten edges";
    case "Blend":
      return "Blend image branches";
    case "Crop":
      return "Crop frame";
    case "Transform":
      return "Transform geometry";
    case "Sharpen":
      return "Sharpen details";
    case "ExportImage":
      return "Export result";
    default:
      return step.node;
  }
}
