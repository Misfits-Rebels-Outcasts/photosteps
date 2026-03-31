import { PipelineDocument, PipelineStep, StepId } from "@/lib/core/types";
import { readStepMeta } from "@/lib/pipeline/helpers";

interface RenderOptions {
  resolveImageUrl: (source: string) => string | undefined;
}

export interface RenderResult {
  output?: HTMLCanvasElement;
  warnings: string[];
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(width));
  canvas.height = Math.max(1, Math.floor(height));
  return canvas;
}

function cloneCanvas(input: HTMLCanvasElement): HTMLCanvasElement {
  const out = createCanvas(input.width, input.height);
  const ctx = out.getContext("2d");
  if (ctx) {
    ctx.drawImage(input, 0, 0);
  }
  return out;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

function getNumber(params: Record<string, unknown>, key: string, fallback: number): number {
  const value = params[key];
  return typeof value === "number" ? value : fallback;
}

function applyAdjust(
  input: HTMLCanvasElement,
  params: Record<string, unknown>
): HTMLCanvasElement {
  const out = cloneCanvas(input);
  const ctx = out.getContext("2d");
  if (!ctx) return out;

  const imageData = ctx.getImageData(0, 0, out.width, out.height);
  const data = imageData.data;

  const exposure = getNumber(params, "exposure", 0);
  const brightness = getNumber(params, "brightness", 0);
  const contrast = getNumber(params, "contrast", 1);
  const saturation = getNumber(params, "saturation", 1);
  const temperature = getNumber(params, "temperature", 0);
  const tint = getNumber(params, "tint", 0);

  const exposureMul = Math.pow(2, exposure);
  const brightnessOffset = brightness * 255;
  const tempShift = (temperature / 1000) * 36;
  const tintShift = (tint / 100) * 24;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    r = r * exposureMul + brightnessOffset;
    g = g * exposureMul + brightnessOffset;
    b = b * exposureMul + brightnessOffset;

    r = (r - 128) * contrast + 128;
    g = (g - 128) * contrast + 128;
    b = (b - 128) * contrast + 128;

    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    r = luma + (r - luma) * saturation;
    g = luma + (g - luma) * saturation;
    b = luma + (b - luma) * saturation;

    r += tempShift;
    b -= tempShift;
    g += tintShift;
    r -= tintShift * 0.35;
    b += tintShift * 0.35;

    data[i] = clamp(r, 0, 255);
    data[i + 1] = clamp(g, 0, 255);
    data[i + 2] = clamp(b, 0, 255);
  }

  ctx.putImageData(imageData, 0, 0);
  return out;
}

function applyBlur(input: HTMLCanvasElement, params: Record<string, unknown>): HTMLCanvasElement {
  const out = createCanvas(input.width, input.height);
  const ctx = out.getContext("2d");
  if (!ctx) return cloneCanvas(input);
  const radius = clamp(getNumber(params, "radius", 0), 0, 100);
  ctx.filter = `blur(${radius}px)`;
  ctx.drawImage(input, 0, 0);
  ctx.filter = "none";
  return out;
}

function applyColorTone(
  input: HTMLCanvasElement,
  params: Record<string, unknown>
): HTMLCanvasElement {
  const style = String(params.style ?? "none");
  const intensity = clamp(getNumber(params, "intensity", 0), 0, 1);
  const out = cloneCanvas(input);
  const ctx = out.getContext("2d");
  if (!ctx || style === "none" || intensity <= 0) return out;

  ctx.save();
  ctx.globalAlpha = intensity * 0.35;
  if (style === "warm") ctx.fillStyle = "#ffb074";
  if (style === "cool") ctx.fillStyle = "#74b7ff";
  if (style === "sepia") ctx.fillStyle = "#9f7a4a";
  if (style === "cinematic") ctx.fillStyle = "#4f6280";
  if (style === "mono") ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.restore();

  if (style === "mono") {
    const imageData = ctx.getImageData(0, 0, out.width, out.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const luma = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      data[i] = luma;
      data[i + 1] = luma;
      data[i + 2] = luma;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  return out;
}

function applyBlend(
  imageA: HTMLCanvasElement,
  imageB: HTMLCanvasElement,
  params: Record<string, unknown>
): HTMLCanvasElement {
  const width = Math.max(imageA.width, imageB.width);
  const height = Math.max(imageA.height, imageB.height);
  const out = createCanvas(width, height);
  const ctx = out.getContext("2d");
  if (!ctx) return out;

  const opacity = clamp(getNumber(params, "opacity", 0.5), 0, 1);
  ctx.drawImage(imageA, 0, 0, width, height);
  ctx.globalAlpha = opacity;
  ctx.drawImage(imageB, 0, 0, width, height);
  ctx.globalAlpha = 1;

  return out;
}

function applyVignette(
  input: HTMLCanvasElement,
  params: Record<string, unknown>
): HTMLCanvasElement {
  const out = cloneCanvas(input);
  const ctx = out.getContext("2d");
  if (!ctx) return out;

  const intensity = clamp(getNumber(params, "intensity", 0.2), -1, 1);
  const radius = clamp(getNumber(params, "radius", 0.8), 0.1, 1.5);
  const softness = clamp(getNumber(params, "softness", 0.6), 0, 1);
  const cx = out.width / 2;
  const cy = out.height / 2;
  const maxR = Math.max(out.width, out.height) * radius;

  const inner = maxR * (1 - softness);
  const outer = maxR;
  const gradient = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
  const alpha = Math.abs(intensity) * 0.85;
  const color =
    intensity >= 0
      ? `rgba(0, 0, 0, ${alpha.toFixed(3)})`
      : `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, color);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, out.width, out.height);

  return out;
}

function applyTransform(
  input: HTMLCanvasElement,
  params: Record<string, unknown>
): HTMLCanvasElement {
  const out = createCanvas(input.width, input.height);
  const ctx = out.getContext("2d");
  if (!ctx) return cloneCanvas(input);

  const rotation = (getNumber(params, "rotation", 0) * Math.PI) / 180;
  const scaleX = getNumber(params, "scaleX", 1);
  const scaleY = getNumber(params, "scaleY", 1);
  const translateXNorm = getNumber(params, "translateX", 0);
  const translateYNorm = getNumber(params, "translateY", 0);
  const flipX = Boolean(params.flipX);
  const flipY = Boolean(params.flipY);

  const tx = translateXNorm * input.width;
  const ty = translateYNorm * input.height;
  const cx = input.width / 2;
  const cy = input.height / 2;

  ctx.save();
  ctx.translate(cx + tx, cy + ty);
  ctx.rotate(rotation);
  ctx.scale(scaleX * (flipX ? -1 : 1), scaleY * (flipY ? -1 : 1));
  ctx.drawImage(input, -cx, -cy);
  ctx.restore();

  return out;
}

function applyCrop(
  input: HTMLCanvasElement,
  params: Record<string, unknown>
): HTMLCanvasElement {
  const rectRaw = params.rect;
  if (!rectRaw || typeof rectRaw !== "object") {
    return cloneCanvas(input);
  }
  const rect = rectRaw as { x?: number; y?: number; width?: number; height?: number };
  const xRaw = typeof rect.x === "number" ? rect.x : 0;
  const yRaw = typeof rect.y === "number" ? rect.y : 0;
  const wRaw = typeof rect.width === "number" ? rect.width : input.width;
  const hRaw = typeof rect.height === "number" ? rect.height : input.height;

  // Support both normalized rects [0..1] and pixel rects.
  const normalized = wRaw <= 1 && hRaw <= 1;
  const sx = normalized ? xRaw * input.width : xRaw;
  const sy = normalized ? yRaw * input.height : yRaw;
  const sw = normalized ? wRaw * input.width : wRaw;
  const sh = normalized ? hRaw * input.height : hRaw;

  const sourceX = clamp(Math.floor(sx), 0, input.width - 1);
  const sourceY = clamp(Math.floor(sy), 0, input.height - 1);
  const sourceW = clamp(Math.floor(sw), 1, input.width - sourceX);
  const sourceH = clamp(Math.floor(sh), 1, input.height - sourceY);

  const out = createCanvas(sourceW, sourceH);
  const ctx = out.getContext("2d");
  if (!ctx) return cloneCanvas(input);
  ctx.drawImage(input, sourceX, sourceY, sourceW, sourceH, 0, 0, sourceW, sourceH);
  return out;
}

function applySharpen(
  input: HTMLCanvasElement,
  params: Record<string, unknown>
): HTMLCanvasElement {
  const amount = clamp(getNumber(params, "amount", 0), 0, 3);
  const radius = clamp(getNumber(params, "radius", 1), 0, 10);
  const threshold = clamp(getNumber(params, "threshold", 0.05), 0, 1) * 255;
  if (amount <= 0) return cloneCanvas(input);

  const original = cloneCanvas(input);
  const blurred = createCanvas(input.width, input.height);
  const blurCtx = blurred.getContext("2d");
  if (!blurCtx) return original;
  blurCtx.filter = `blur(${radius}px)`;
  blurCtx.drawImage(original, 0, 0);
  blurCtx.filter = "none";

  const srcCtx = original.getContext("2d");
  const out = cloneCanvas(original);
  const outCtx = out.getContext("2d");
  if (!srcCtx || !outCtx) return original;

  const originalData = srcCtx.getImageData(0, 0, out.width, out.height);
  const blurredData = blurCtx.getImageData(0, 0, out.width, out.height);
  const outData = outCtx.getImageData(0, 0, out.width, out.height);

  for (let i = 0; i < outData.data.length; i += 4) {
    const dr = originalData.data[i] - blurredData.data[i];
    const dg = originalData.data[i + 1] - blurredData.data[i + 1];
    const db = originalData.data[i + 2] - blurredData.data[i + 2];

    outData.data[i] =
      Math.abs(dr) < threshold
        ? originalData.data[i]
        : clamp(originalData.data[i] + dr * amount, 0, 255);
    outData.data[i + 1] =
      Math.abs(dg) < threshold
        ? originalData.data[i + 1]
        : clamp(originalData.data[i + 1] + dg * amount, 0, 255);
    outData.data[i + 2] =
      Math.abs(db) < threshold
        ? originalData.data[i + 2]
        : clamp(originalData.data[i + 2] + db * amount, 0, 255);
    outData.data[i + 3] = originalData.data[i + 3];
  }

  outCtx.putImageData(outData, 0, 0);
  return out;
}

function hasSingleInput(step: PipelineStep): step is PipelineStep & { input: StepId } {
  return "input" in step && step.input !== undefined;
}

async function evalStep(
  step: PipelineStep,
  rendered: Map<StepId, HTMLCanvasElement>,
  warnings: string[],
  options: RenderOptions
): Promise<HTMLCanvasElement | undefined> {
  if (step.node === "ReadImage") {
    const source = String(step.params.source ?? "");
    const url = options.resolveImageUrl(source);
    if (!url) {
      warnings.push(`ReadImage source not found: ${source || "(empty)"}`);
      return undefined;
    }
    const img = await loadImage(url);
    const canvas = createCanvas(img.naturalWidth || img.width, img.naturalHeight || img.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;
    ctx.drawImage(img, 0, 0);
    return canvas;
  }

  if (step.node === "Blend" && "inputs" in step && step.inputs) {
    const imageA = rendered.get(step.inputs.imageA as StepId);
    const imageB = rendered.get(step.inputs.imageB as StepId);
    if (!imageA || !imageB) {
      warnings.push(`Blend is missing input images at step ${String(step.id)}.`);
      return imageA ?? imageB;
    }
    return applyBlend(imageA, imageB, step.params);
  }

  if (!hasSingleInput(step)) {
    warnings.push(`Step ${String(step.id)} (${step.node}) has no input; skipped.`);
    return undefined;
  }

  const input = rendered.get(step.input);
  if (!input) {
    warnings.push(`Step ${String(step.id)} (${step.node}) input is unresolved.`);
    return undefined;
  }

  if (step.node === "Adjust") return applyAdjust(input, step.params);
  if (step.node === "Blur") return applyBlur(input, step.params);
  if (step.node === "ColorTone") return applyColorTone(input, step.params);
  if (step.node === "Vignette") return applyVignette(input, step.params);
  if (step.node === "Transform") return applyTransform(input, step.params);
  if (step.node === "Crop") return applyCrop(input, step.params);
  if (step.node === "Sharpen") return applySharpen(input, step.params);
  if (step.node === "ExportImage") return cloneCanvas(input);

  return cloneCanvas(input);
}

export async function renderPipelineToCanvas(
  pipeline: PipelineDocument,
  options: RenderOptions
): Promise<RenderResult> {
  const rendered = new Map<StepId, HTMLCanvasElement>();
  const warnings: string[] = [];

  for (const step of pipeline.steps) {
    if (readStepMeta(step)?.enabled === false) continue;
    const canvas = await evalStep(step, rendered, warnings, options);
    if (canvas) {
      rendered.set(step.id, canvas);
    }
  }

  const lastStep = [...pipeline.steps]
    .filter((s) => readStepMeta(s)?.enabled !== false)
    .pop();
  const output = lastStep ? rendered.get(lastStep.id) : undefined;
  return { output, warnings };
}
