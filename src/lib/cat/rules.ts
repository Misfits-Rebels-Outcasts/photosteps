import { IntentRule } from "@/lib/cat/intentTypes";

export const INTENT_RULES: IntentRule[] = [
  { intent: "warm", patterns: [/\bwarmer\b/, /\bwarm\b/] },
  { intent: "cool", patterns: [/\bcooler\b/, /\bcool\b/] },
  { intent: "brighter", patterns: [/\bbrighter\b/, /\bbrighten\b/] },
  { intent: "darker", patterns: [/\bdarker\b/, /\bdarken\b/] },
  {
    intent: "contrast_up",
    patterns: [/\bmore contrast\b/, /\bincrease contrast\b/, /\bhigher contrast\b/],
  },
  {
    intent: "contrast_down",
    patterns: [/\bless contrast\b/, /\blower contrast\b/, /\bflatter\b/],
  },
  {
    intent: "saturation_up",
    patterns: [/\bmore vivid\b/, /\bmore saturated\b/, /\bboost saturation\b/],
  },
  {
    intent: "saturation_down",
    patterns: [/\bless saturated\b/, /\bdesaturate\b/, /\bmuted\b/],
  },
  { intent: "motion_blur", patterns: [/\bmotion blur\b/] },
  { intent: "zoom_blur", patterns: [/\bzoom blur\b/] },
  { intent: "soften", patterns: [/\bsoften\b/, /\bsofter\b/, /\bdreamy\b/, /\bblur\b/] },
  { intent: "cinematic", patterns: [/\bcinematic\b/] },
  { intent: "sepia", patterns: [/\bsepia\b/] },
  { intent: "mono", patterns: [/\bmono\b/, /\bblack and white\b/, /\bb&w\b/] },
  { intent: "cool_tone", patterns: [/\bcool tone\b/] },
  { intent: "warm_tone", patterns: [/\bwarm tone\b/] },
  { intent: "sharpen", patterns: [/\bsharpen\b/, /\bsharper\b/, /\bcrisper\b/, /\bmore detail\b/] },
  { intent: "vignette", patterns: [/\bvignette\b/, /\bdarken edges\b/, /\bdraw focus\b/] },
  { intent: "crop_square", patterns: [/\bcrop to square\b/, /\bsquare crop\b/, /\bmake square\b/] },
  { intent: "rotate", patterns: [/\brotate\b/] },
  {
    intent: "blend_with_original",
    patterns: [
      /\bkeep the original\b/,
      /\bblend with original\b/,
      /\bmix with original\b/,
      /\bpreserve original\b/,
    ],
  },
];
