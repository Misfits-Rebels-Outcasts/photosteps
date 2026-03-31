import { NextRequest, NextResponse } from "next/server";

import { proposePipeline } from "@/lib/cat/proposePipeline";
import type { PhotoStepRequest, PhotoStepResponse } from "@/lib/core/types";
import { encodePipelineToToken } from "@/lib/handoff/token";

const VALID_NODES = new Set([
  "ReadImage",
  "ExportImage",
  "Adjust",
  "Crop",
  "Transform",
  "Blur",
  "ColorTone",
  "Sharpen",
  "Vignette",
  "Blend",
]);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function validateRequestBody(body: unknown): body is PhotoStepRequest {
  if (!isObject(body)) return false;
  if (typeof body.instruction !== "string") return false;
  if (!isObject(body.pipeline)) return false;
  return true;
}

function isPipelineDocumentShape(value: unknown): boolean {
  if (!isObject(value)) return false;
  if (!Array.isArray(value.steps)) return false;
  return (
    typeof value.pipelineVersion === "string" &&
    typeof value.app === "string" &&
    typeof value.engine === "string"
  );
}

function idKey(id: unknown): string {
  return `${typeof id}:${String(id)}`;
}

function canonicalizePipelineForSchema(
  pipeline: PhotoStepRequest["pipeline"]
): { pipeline: PhotoStepRequest["pipeline"]; idMap: Map<string, number> } {
  const copy = JSON.parse(JSON.stringify(pipeline)) as Record<string, unknown>;
  if (!Array.isArray(copy.steps)) {
    return { pipeline, idMap: new Map<string, number>() };
  }

  const rawSteps = copy.steps as Array<Record<string, unknown>>;
  const idMap = new Map<string, number>();
  const usedIds = new Set<number>();

  let nextId = 1;
  for (const raw of rawSteps) {
    const originalId = raw.id;
    const usable =
      typeof originalId === "number" &&
      Number.isInteger(originalId) &&
      originalId > 0 &&
      !usedIds.has(originalId);
    const assigned = usable ? originalId : nextId;
    idMap.set(idKey(originalId), assigned);
    usedIds.add(assigned);
    raw.id = assigned;
    nextId = Math.max(nextId, assigned + 1);
  }

  for (const raw of rawSteps) {
    if ("meta" in raw && !("metadata" in raw)) {
      raw.metadata = raw.meta;
    }
    delete raw.meta;

    if ("input" in raw) {
      const mapped = idMap.get(idKey(raw.input));
      if (mapped !== undefined) {
        raw.input = mapped;
      }
    }

    if ("inputs" in raw && isObject(raw.inputs)) {
      const inputs = { ...raw.inputs } as Record<string, unknown>;
      for (const [k, v] of Object.entries(inputs)) {
        if (v === null) continue;
        const mapped = idMap.get(idKey(v));
        if (mapped !== undefined) {
          inputs[k] = mapped;
        }
      }
      raw.inputs = inputs;
    }
  }

  return { pipeline: copy as unknown as PhotoStepRequest["pipeline"], idMap };
}

function validatePipelineDocumentShape(
  pipeline: PhotoStepRequest["pipeline"]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!isObject(pipeline)) {
    return { valid: false, errors: ["pipeline must be an object"] };
  }
  if (pipeline.pipelineVersion !== "2.0") {
    errors.push("pipelineVersion must be '2.0'");
  }
  if (pipeline.app !== "PhotoSteps") {
    errors.push("app must be 'PhotoSteps'");
  }
  if (pipeline.engine !== "CAT") {
    errors.push("engine must be 'CAT'");
  }
  if (!Array.isArray(pipeline.steps) || pipeline.steps.length === 0) {
    errors.push("steps must be a non-empty array");
    return { valid: errors.length === 0, errors };
  }

  for (let i = 0; i < pipeline.steps.length; i += 1) {
    const step = pipeline.steps[i];
    if (!isObject(step)) {
      errors.push(`/steps/${i} must be an object`);
      continue;
    }
    if (!VALID_NODES.has(String(step.node))) {
      errors.push(`/steps/${i}/node is not a supported node`);
    }
    if (typeof step.id !== "number" || !Number.isInteger(step.id) || step.id < 1) {
      errors.push(`/steps/${i}/id must be a positive integer`);
    }
    if (!isObject(step.params)) {
      errors.push(`/steps/${i}/params must be an object`);
    }

    const node = String(step.node);
    if (node === "ReadImage") {
      if (!isObject(step.params) || typeof step.params.source !== "string" || !step.params.source) {
        errors.push(`/steps/${i}/params/source is required for ReadImage`);
      }
    } else if (node === "Blend") {
      if (!isObject(step.inputs)) {
        errors.push(`/steps/${i}/inputs is required for Blend`);
      } else {
        const hasImageA = typeof step.inputs.imageA === "number";
        const hasImageB = typeof step.inputs.imageB === "number";
        const maskOk = step.inputs.mask === null || typeof step.inputs.mask === "number";
        if (!hasImageA) errors.push(`/steps/${i}/inputs/imageA must be a step id`);
        if (!hasImageB) errors.push(`/steps/${i}/inputs/imageB must be a step id`);
        if (!maskOk) errors.push(`/steps/${i}/inputs/mask must be step id or null`);
      }
    } else {
      if (typeof step.input !== "number") {
        errors.push(`/steps/${i}/input must be a step id`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

function badRequest(
  code: PhotoStepResponse extends infer R
    ? R extends { ok: false; error: { code: infer C } }
      ? C
      : never
    : never,
  message: string,
  warnings: string[] = []
) {
  return NextResponse.json(
    {
      ok: false,
      error: { code, message },
      warnings,
    },
    { status: 400 }
  );
}

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return badRequest("INVALID_REQUEST", "Request body is not valid JSON.");
  }

  if (!validateRequestBody(body)) {
    return badRequest(
      "INVALID_REQUEST",
      "Request must include an instruction string and a pipeline object."
    );
  }

  const request = body as PhotoStepRequest;
  if (!request.instruction.trim()) {
    return badRequest("INVALID_REQUEST", "Instruction must not be empty.");
  }
  if (!isPipelineDocumentShape(request.pipeline)) {
    return badRequest(
      "INVALID_REQUEST",
      "pipeline must be a PhotoSteps pipeline document (not a node catalog)."
    );
  }
  const canonicalIncoming = canonicalizePipelineForSchema(request.pipeline);
  const incomingPipeline = canonicalIncoming.pipeline;
  const mappedSelectionId =
    request.selection?.selectedStepId !== undefined
      ? canonicalIncoming.idMap.get(idKey(request.selection.selectedStepId))
      : undefined;
  const normalizedRequest: PhotoStepRequest = {
    ...request,
    pipeline: incomingPipeline,
    selection:
      mappedSelectionId !== undefined ? { selectedStepId: mappedSelectionId } : request.selection,
  };

  const validIncoming = validatePipelineDocumentShape(incomingPipeline);
  if (!validIncoming.valid) {
    return badRequest(
      "INVALID_PIPELINE",
      "Incoming pipeline does not match the PhotoSteps schema.",
      validIncoming.errors
    );
  }

  const result = proposePipeline(normalizedRequest);

  if (result.parsed.intents.length === 0) {
    return badRequest(
      "UNSUPPORTED_INTENT",
      "The instruction could not be mapped confidently to the current node catalog.",
      [
        "Try: make it warmer, brighter, dreamy, cinematic, sharper, darker at the edges, crop to square, or blend with the original.",
      ]
    );
  }

  const outgoingPipeline = canonicalizePipelineForSchema(result.proposed).pipeline;
  const validOutgoing = validatePipelineDocumentShape(outgoingPipeline);
  if (!validOutgoing.valid) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "VALIDATION_FAILED",
          message: "The proposed pipeline failed schema validation.",
        },
        warnings: validOutgoing.errors,
      } satisfies PhotoStepResponse,
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      summary: result.summary,
      notes: result.notes,
      handoffUrl: (() => {
        const origin = new URL(req.url).origin;
        const token = encodePipelineToToken(outgoingPipeline);
        const params = new URLSearchParams({ p: token });
        if (request.imageUrl && /^https?:\/\//.test(request.imageUrl)) {
          params.set("img", request.imageUrl);
        }
        return `${origin}/studio?${params.toString()}`;
      })(),
      warnings: result.warnings,
      proposedPipeline: outgoingPipeline,
    } satisfies PhotoStepResponse,
    { status: 200 }
  );
}
