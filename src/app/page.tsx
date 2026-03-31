import Link from "next/link";
import { ChatPromptChips } from "@/components/ChatPromptChips";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f3ea] text-[#1b1a17]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-[-120px] h-[360px] w-[360px] rounded-full bg-[#f9c98a]/70 blur-3xl" />
        <div className="absolute right-[-100px] top-[120px] h-[420px] w-[420px] rounded-full bg-[#b0d6cb]/80 blur-3xl" />
        <div className="absolute bottom-[-160px] left-1/3 h-[420px] w-[420px] rounded-full bg-[#f1a5a0]/60 blur-3xl" />
      </div>

      <section className="relative mx-auto flex w-full max-w-6xl flex-col px-6 pb-24 pt-8 md:px-10">
        <header className="flex items-center justify-between">
          <p className="text-sm font-semibold tracking-[0.2em] text-[#3f3a33]">PHOTOSTEPS</p>
          <div className="flex items-center gap-2">
            <Link
              href="/help"
              className="rounded-full border border-[#2f2a24]/20 bg-white/90 px-4 py-2 text-sm font-medium text-[#1f1c18] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Help
            </Link>
            <Link
              href="/concepts"
              className="rounded-full border border-[#2f2a24]/20 bg-white/90 px-4 py-2 text-sm font-medium text-[#1f1c18] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Concepts
            </Link>
            <Link
              href="/studio"
              className="rounded-full border border-[#2f2a24]/20 bg-white/90 px-5 py-2 text-sm font-medium text-[#1f1c18] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Try PhotoSteps
            </Link>
          </div>
        </header>

        <div className="mt-16 grid items-end gap-10 md:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="inline-block rounded-full border border-[#2f2a24]/15 bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-[#63584b]">
              Edit by intent, not chaos
            </p>
            <h1 className="mt-5 text-5xl leading-[1.02] tracking-tight md:text-7xl">
              Photo editing that thinks in steps, not spaghetti.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#4a433b]">
              Describe your look, get a clean editable pipeline, and keep full creative control.
              PhotoSteps turns natural language into repeatable image workflows.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/studio"
                className="rounded-full bg-[#1f1b17] px-6 py-3 text-sm font-semibold text-[#fffaf2] transition hover:bg-[#353029]"
              >
                Try PhotoSteps
              </Link>
              <Link
                href="/help"
                className="rounded-full border border-[#2f2a24]/20 bg-white/90 px-6 py-3 text-sm font-semibold text-[#1f1b17] transition hover:bg-[#fff7eb]"
              >
                Help & Node Guide
              </Link>
              <Link
                href="/concepts"
                className="rounded-full border border-[#2f2a24]/20 bg-white/90 px-6 py-3 text-sm font-semibold text-[#1f1b17] transition hover:bg-[#fff7eb]"
              >
                Concepts
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-[#2f2a24]/10 bg-white/80 p-5 shadow-[0_30px_80px_-35px_rgba(48,38,28,0.35)] backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6a5f52]">
              Live Pipeline Preview
            </p>
            <div className="mt-4 space-y-2 rounded-2xl bg-[#1f1b17] p-4 text-xs text-[#f3eee6]">
              <p>1. ReadImage</p>
              <p>2. Adjust (warmth + contrast)</p>
              <p>3. Blur (subtle dreamy look)</p>
              <p>4. Sharpen (light detail recovery)</p>
              <p>5. ExportImage</p>
            </div>
            <p className="mt-4 text-sm text-[#5d5448]">
              Built for artists who want clarity, speed, and consistent results.
            </p>
          </div>
        </div>

        <section id="how-it-works" className="mt-20 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Speak Your Intent",
              body: "Tell PhotoSteps what you want: warmer skin, dreamy softness, cinematic mood.",
            },
            {
              title: "Review the Pipeline",
              body: "Get a structured proposal with editable steps you can inspect and tweak.",
            },
            {
              title: "Export Locally",
              body: "Render in the browser, keep your files local, and export the final look instantly.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-[#2f2a24]/10 bg-white/75 p-5 shadow-sm"
            >
              <h2 className="text-xl tracking-tight">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#5a5146]">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border border-[#2f2a24]/10 bg-white/80 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6a5f52]">
                Open in ChatGPT
              </p>
              <h3 className="mt-1 text-2xl tracking-tight text-[#1f1b17]">
                Use @PhotoStep directly in chat
              </h3>
              <p className="mt-2 text-sm text-[#5a5146]">
                Paste one of these prompts, then open the handoff link in PhotoSteps Studio.
              </p>
            </div>
            <a
              href="https://chatgpt.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#1f1b17] px-5 py-2.5 text-sm font-semibold text-[#fffaf2] transition hover:bg-[#353029]"
            >
              Open ChatGPT
            </a>
          </div>

          <ChatPromptChips />
        </section>
      </section>
    </main>
  );
}
