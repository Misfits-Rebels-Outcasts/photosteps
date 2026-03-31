import { ParsedIntent, SupportedIntent } from "@/lib/core/types";

export interface IntentRule {
  intent: SupportedIntent;
  patterns: RegExp[];
}

export interface ParseResult extends ParsedIntent {
  unsupported: string[];
}
