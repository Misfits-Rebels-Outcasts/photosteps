import { ParseResult } from "@/lib/cat/intentTypes";
import { INTENT_RULES } from "@/lib/cat/rules";

function detectStrength(text: string): number {
  if (/\b(slightly|a bit|little|subtle|gently)\b/.test(text)) return 0.25;
  if (/\b(moderately|medium)\b/.test(text)) return 0.5;
  if (/\b(strongly|very|dramatically|a lot)\b/.test(text)) return 0.85;
  return 0.5;
}

export function parseInstruction(instruction: string): ParseResult {
  const text = instruction.toLowerCase();
  const intents = new Set<ParseResult["intents"][number]>();

  for (const rule of INTENT_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(text))) {
      intents.add(rule.intent);
    }
  }

  return {
    intents: Array.from(intents),
    strength: detectStrength(text),
    raw: instruction,
    unsupported: [],
  };
}
