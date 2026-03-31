import { PipelineDocument } from "@/lib/core/types";

function toBase64(input: string): string {
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    return window.btoa(unescape(encodeURIComponent(input)));
  }
  return Buffer.from(input, "utf-8").toString("base64");
}

function fromBase64(input: string): string {
  if (typeof window !== "undefined" && typeof window.atob === "function") {
    return decodeURIComponent(escape(window.atob(input)));
  }
  return Buffer.from(input, "base64").toString("utf-8");
}

function toBase64Url(base64: string): string {
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(base64Url: string): string {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
  return base64 + pad;
}

export function encodePipelineToToken(pipeline: PipelineDocument): string {
  const json = JSON.stringify(pipeline);
  return toBase64Url(toBase64(json));
}

export function decodePipelineFromToken(token: string): PipelineDocument {
  const json = fromBase64(fromBase64Url(token));
  return JSON.parse(json) as PipelineDocument;
}
