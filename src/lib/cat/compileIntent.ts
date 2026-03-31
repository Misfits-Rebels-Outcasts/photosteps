import { ParseResult } from "@/lib/cat/intentTypes";
import {
  findCurrentSourceIdWithAnchor,
  findInsertionIndex,
} from "@/lib/cat/findInsertionPoint";
import { makeCompatibleStepId } from "@/lib/core/ids";
import { getDefaultParams } from "@/lib/core/defaultParams";
import { MultiInputStep, PipelineDocument, PipelineStep, StepId } from "@/lib/core/types";
import {
  clonePipeline,
  findReadImageStep,
  findReusableStep,
  writeStepMeta,
} from "@/lib/pipeline/helpers";

interface CompileRuntime {
  pipeline: PipelineDocument;
  currentSource?: string | number;
  preferReuse: boolean;
  allowBranching: boolean;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function ensureCatMeta(step: PipelineStep, intentText: string, label?: string): void {
  const current = step.meta ?? step.metadata ?? {};
  writeStepMeta(step, {
    ...current,
    createdBy: current.createdBy ?? "cat",
    intent: intentText,
    enabled: current.enabled ?? true,
    ...(label ? { label } : {}),
  });
}

function insertBeforeExport(runtime: CompileRuntime, step: PipelineStep): void {
  const index = findInsertionIndex(runtime.pipeline);
  runtime.pipeline.steps.splice(index, 0, step);
}

function createSingleInputStep(
  runtime: CompileRuntime,
  node: string,
  label?: string
): PipelineStep {
  const step: PipelineStep = {
    id: makeCompatibleStepId(runtime.pipeline, node.toLowerCase()),
    node,
    input: runtime.currentSource,
    params: getDefaultParams(node),
    metadata: {
      createdBy: "cat",
      enabled: true,
      ...(label ? { label } : {}),
    },
  };

  insertBeforeExport(runtime, step);
  return step;
}

function getOrCreate(runtime: CompileRuntime, node: string, label?: string): PipelineStep {
  const reusable = runtime.preferReuse ? findReusableStep(runtime.pipeline, node) : undefined;
  if (reusable) return reusable;
  return createSingleInputStep(runtime, node, label);
}

function applyAdjustIntent(runtime: CompileRuntime, parsed: ParseResult, intent: string): void {
  const step = getOrCreate(runtime, "Adjust", "Adjust");
  const params = { ...step.params } as Record<string, unknown>;

  if (intent === "warm") {
    params.temperature = clamp((Number(params.temperature) || 0) + 500 * parsed.strength, -1000, 1000);
  }
  if (intent === "cool") {
    params.temperature = clamp((Number(params.temperature) || 0) - 500 * parsed.strength, -1000, 1000);
  }
  if (intent === "brighter") {
    params.exposure = clamp((Number(params.exposure) || 0) + 0.4 * parsed.strength, -2, 2);
  }
  if (intent === "darker") {
    params.exposure = clamp((Number(params.exposure) || 0) - 0.4 * parsed.strength, -2, 2);
  }
  if (intent === "contrast_up") {
    params.contrast = clamp((Number(params.contrast) || 1) + 0.25 * parsed.strength, 0, 4);
  }
  if (intent === "contrast_down") {
    params.contrast = clamp((Number(params.contrast) || 1) - 0.2 * parsed.strength, 0, 4);
  }
  if (intent === "saturation_up") {
    params.saturation = clamp((Number(params.saturation) || 1) + 0.2 * parsed.strength, 0, 2);
  }
  if (intent === "saturation_down") {
    params.saturation = clamp((Number(params.saturation) || 1) - 0.2 * parsed.strength, 0, 2);
  }

  step.params = params;
  ensureCatMeta(step, parsed.raw, "Adjust");
  runtime.currentSource = step.id;
}

function applyBlurIntent(runtime: CompileRuntime, parsed: ParseResult, intent: string): void {
  const step = getOrCreate(runtime, "Blur", "Blur");
  const params = { ...step.params } as Record<string, unknown>;

  if (intent === "soften") {
    params.type = "gaussian";
    params.radius = clamp((Number(params.radius) || 0) + 8 * parsed.strength, 0, 100);
  }
  if (intent === "motion_blur") {
    params.type = "motion";
    params.radius = clamp((Number(params.radius) || 0) + 10 * parsed.strength, 0, 100);
  }
  if (intent === "zoom_blur") {
    params.type = "zoom";
    params.radius = clamp((Number(params.radius) || 0) + 10 * parsed.strength, 0, 100);
  }

  step.params = params;
  ensureCatMeta(step, parsed.raw, "Blur");
  runtime.currentSource = step.id;
}

function applyToneIntent(runtime: CompileRuntime, parsed: ParseResult, intent: string): void {
  const step = getOrCreate(runtime, "ColorTone", "Tone");
  const params = { ...step.params } as Record<string, unknown>;

  if (intent === "cinematic") params.style = "cinematic";
  if (intent === "sepia") params.style = "sepia";
  if (intent === "mono") params.style = "mono";
  if (intent === "cool_tone") params.style = "cool";
  if (intent === "warm_tone") params.style = "warm";
  params.intensity = clamp(Math.max(Number(params.intensity) || 0, 0.35 * parsed.strength), 0, 1);

  step.params = params;
  ensureCatMeta(step, parsed.raw, "Tone");
  runtime.currentSource = step.id;
}

function applySharpenIntent(runtime: CompileRuntime, parsed: ParseResult): void {
  const step = getOrCreate(runtime, "Sharpen", "Sharpen");
  const params = { ...step.params } as Record<string, unknown>;

  params.amount = clamp((Number(params.amount) || 0) + 0.8 * parsed.strength, 0, 3);
  params.radius = clamp(Number(params.radius) || 1.0, 0, 10);

  step.params = params;
  ensureCatMeta(step, parsed.raw, "Sharpen");
  runtime.currentSource = step.id;
}

function applyVignetteIntent(runtime: CompileRuntime, parsed: ParseResult): void {
  const step = getOrCreate(runtime, "Vignette", "Vignette");
  const params = { ...step.params } as Record<string, unknown>;

  params.intensity = clamp((Number(params.intensity) || 0) + 0.3 * parsed.strength, -1, 1);
  params.radius = clamp(Number(params.radius) || 0.8, 0, 1.5);
  params.softness = clamp(Number(params.softness) || 0.6, 0, 1);

  step.params = params;
  ensureCatMeta(step, parsed.raw, "Vignette");
  runtime.currentSource = step.id;
}

function applyCropSquareIntent(runtime: CompileRuntime, parsed: ParseResult): void {
  const step = getOrCreate(runtime, "Crop", "Square crop");
  step.params = {
    ...step.params,
    rect: {
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    },
    aspectRatio: "1:1",
  };
  ensureCatMeta(step, parsed.raw, "Square crop");
  runtime.currentSource = step.id;
}

function applyRotateIntent(runtime: CompileRuntime, parsed: ParseResult): void {
  const step = getOrCreate(runtime, "Transform", "Rotate");
  const params = { ...step.params } as Record<string, unknown>;

  params.rotation = clamp((Number(params.rotation) || 0) + 10 * parsed.strength, -180, 180);
  params.scaleX = Number(params.scaleX) || 1;
  params.scaleY = Number(params.scaleY) || 1;

  step.params = params;
  ensureCatMeta(step, parsed.raw, "Rotate");
  runtime.currentSource = step.id;
}

function applyBlendWithOriginal(runtime: CompileRuntime, parsed: ParseResult): void {
  if (!runtime.allowBranching || runtime.currentSource === undefined) return;

  const readStep = findReadImageStep(runtime.pipeline);
  if (!readStep) return;

  const reusable = runtime.preferReuse ? findReusableStep(runtime.pipeline, "Blend") : undefined;
  const reusableBlend =
    reusable && "inputs" in reusable ? (reusable as MultiInputStep) : undefined;
  const blendStep: MultiInputStep =
    reusableBlend ??
    ({
      id: makeCompatibleStepId(runtime.pipeline, "blend"),
      node: "Blend",
      inputs: {
        imageA: readStep.id,
        imageB: runtime.currentSource,
        mask: null,
      },
      params: {
        ...getDefaultParams("Blend"),
      },
      metadata: {
        createdBy: "cat",
        enabled: true,
        label: "Blend original",
      },
    } as MultiInputStep);

  blendStep.inputs = {
    imageA: readStep.id,
    imageB: runtime.currentSource,
    mask: null,
  };
  blendStep.params = {
    ...blendStep.params,
    mode: "softLight",
    opacity: clamp(Number((blendStep.params as Record<string, unknown>).opacity) || 0.35, 0, 1),
  };
  ensureCatMeta(blendStep, parsed.raw, "Blend original");

  if (!reusableBlend) {
    insertBeforeExport(runtime, blendStep as PipelineStep);
  }
  runtime.currentSource = blendStep.id;
}

export function compileIntent(
  parsed: ParseResult,
  inputPipeline: PipelineDocument,
  options?: {
    preferReuseExistingSteps?: boolean;
    allowBranching?: boolean;
    anchorStepId?: StepId;
  }
): PipelineDocument {
  const runtime: CompileRuntime = {
    pipeline: clonePipeline(inputPipeline),
    currentSource: findCurrentSourceIdWithAnchor(inputPipeline, options?.anchorStepId),
    preferReuse: options?.preferReuseExistingSteps ?? true,
    allowBranching: options?.allowBranching ?? true,
  };

  if (runtime.currentSource === undefined) return runtime.pipeline;

  for (const intent of parsed.intents) {
    if (
      intent === "warm" ||
      intent === "cool" ||
      intent === "brighter" ||
      intent === "darker" ||
      intent === "contrast_up" ||
      intent === "contrast_down" ||
      intent === "saturation_up" ||
      intent === "saturation_down"
    ) {
      applyAdjustIntent(runtime, parsed, intent);
      continue;
    }

    if (intent === "soften" || intent === "motion_blur" || intent === "zoom_blur") {
      applyBlurIntent(runtime, parsed, intent);
      continue;
    }

    if (
      intent === "cinematic" ||
      intent === "sepia" ||
      intent === "mono" ||
      intent === "cool_tone" ||
      intent === "warm_tone"
    ) {
      applyToneIntent(runtime, parsed, intent);
      continue;
    }

    if (intent === "sharpen") {
      applySharpenIntent(runtime, parsed);
      continue;
    }
    if (intent === "vignette") {
      applyVignetteIntent(runtime, parsed);
      continue;
    }
    if (intent === "crop_square") {
      applyCropSquareIntent(runtime, parsed);
      continue;
    }
    if (intent === "rotate") {
      applyRotateIntent(runtime, parsed);
      continue;
    }
    if (intent === "blend_with_original") {
      applyBlendWithOriginal(runtime, parsed);
      continue;
    }
  }

  return runtime.pipeline;
}
