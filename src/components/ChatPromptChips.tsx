"use client";

const PROMPTS = [
  "make it warmer and softer but keep the original",
  "add a cinematic look with slightly more contrast",
  "sharpen slightly after blur",
  "draw focus with a soft vignette",
];

export function ChatPromptChips() {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {PROMPTS.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(prompt);
          }}
          className="rounded-full border border-[#2f2a24]/20 bg-white px-4 py-2 text-xs font-medium text-[#3d352d] transition hover:bg-[#fff6e9]"
        >
          Copy: {prompt}
        </button>
      ))}
    </div>
  );
}
