"use client";

interface RegressionResult {
  prompt: string;
  ok: boolean;
  summary: string;
  warnings: string[];
}

interface PromptRegressionPanelProps {
  prompts: string[];
  running: boolean;
  results: RegressionResult[];
  onRunPrompt: (prompt: string) => void;
  onRunAll: () => void;
}

export function PromptRegressionPanel({
  prompts,
  running,
  results,
  onRunPrompt,
  onRunAll,
}: PromptRegressionPanelProps) {
  return (
    <section className="border-b border-black/10 bg-slate-50 px-4 py-3">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            CAT Regression
          </p>
          <button
            type="button"
            disabled={running}
            onClick={onRunAll}
            className="rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {running ? "Running..." : "Run All Week 8 Prompts"}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {prompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={running}
              onClick={() => onRunPrompt(prompt)}
              className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {results.length > 0 && (
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {results.map((result) => (
              <article
                key={result.prompt}
                className={`rounded-lg border p-2 text-xs ${
                  result.ok
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-rose-200 bg-rose-50 text-rose-900"
                }`}
              >
                <p className="font-semibold">{result.ok ? "PASS" : "FAIL"}</p>
                <p className="mt-1">{result.prompt}</p>
                <p className="mt-1">{result.summary}</p>
                {result.warnings.map((warning) => (
                  <p key={warning} className="mt-1">
                    {warning}
                  </p>
                ))}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
