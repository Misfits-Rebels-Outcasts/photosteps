export type StepId = string | number;
export type CreatedBy = "user" | "cat";

export interface StepMeta {
  label?: string;
  createdBy?: CreatedBy;
  intent?: string;
  enabled?: boolean;
}

export interface PipelineDefaults {
  workingColorSpace?: "sRGB" | "linear_sRGB" | "displayP3";
  alphaMode?: "premultiplied" | "straight";
  coordinateSpace?: "normalized_uv" | "pixel";
  origin?: "top_left" | "bottom_left";
}

export interface BaseStep {
  id: StepId;
  node: string;
  params: Record<string, unknown>;
  // Keep both for schema compatibility (metadata) and newer app code (meta).
  meta?: StepMeta;
  metadata?: StepMeta;
}

export interface SingleInputStep extends BaseStep {
  input?: StepId;
}

export interface MultiInputStep extends BaseStep {
  inputs?: Record<string, StepId | null>;
}

export type PipelineStep = SingleInputStep | MultiInputStep;

export interface PipelineDocument {
  pipelineVersion: string;
  app: string;
  engine: string;
  defaults?: PipelineDefaults;
  steps: PipelineStep[];
}

export interface SelectionContext {
  selectedStepId?: StepId;
}

export interface CompileOptions {
  mode?: "propose";
  preserveUserEdits?: boolean;
  preferReuseExistingSteps?: boolean;
  allowBranching?: boolean;
}

export interface PhotoStepRequest {
  instruction: string;
  pipeline: PipelineDocument;
  imageUrl?: string;
  selection?: SelectionContext;
  options?: CompileOptions;
}

export interface PhotoStepSuccessResponse {
  ok: true;
  summary: string;
  notes: string[];
  handoffUrl?: string;
  warnings: string[];
  proposedPipeline: PipelineDocument;
}

export interface PhotoStepErrorResponse {
  ok: false;
  error: {
    code:
      | "INVALID_REQUEST"
      | "INVALID_PIPELINE"
      | "UNSUPPORTED_INTENT"
      | "NORMALIZATION_FAILED"
      | "VALIDATION_FAILED";
    message: string;
  };
  warnings: string[];
}

export type PhotoStepResponse =
  | PhotoStepSuccessResponse
  | PhotoStepErrorResponse;

export type SupportedIntent =
  | "warm"
  | "cool"
  | "brighter"
  | "darker"
  | "contrast_up"
  | "contrast_down"
  | "saturation_up"
  | "saturation_down"
  | "soften"
  | "motion_blur"
  | "zoom_blur"
  | "cinematic"
  | "sepia"
  | "mono"
  | "cool_tone"
  | "warm_tone"
  | "sharpen"
  | "vignette"
  | "crop_square"
  | "rotate"
  | "blend_with_original";

export interface ParsedIntent {
  intents: SupportedIntent[];
  strength: number; // 0.0 - 1.0
  raw: string;
}

export interface ParamDefinition {
  name: string;
  default?: unknown;
}

export interface NodeDefinition {
  name: string;
  semantic?: {
    intentAliases?: string[];
  };
  params?: ParamDefinition[];
}

export interface NodeCatalogDocument {
  specVersion: string;
  product: string;
  engine: string;
  nodes: NodeDefinition[];
}
