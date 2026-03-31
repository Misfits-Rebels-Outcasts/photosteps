import Link from "next/link";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 rounded-2xl border border-[#1b1f24]/10 bg-white p-6 shadow-sm">
      <h2 className="text-2xl tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-[#42515c]">{children}</div>
    </section>
  );
}

export default function ConceptsPage() {
  return (
    <main className="min-h-screen bg-[#f1f5f7] px-6 py-10 text-[#182126] md:px-10">
      <div className="mx-auto w-full max-w-4xl">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5c6871]">
              🐾 PhotoSteps
            </p>
            <h1 className="mt-1 text-4xl tracking-tight md:text-5xl">
              Edit images by editing the process.
            </h1>
            <p className="mt-3 text-base text-[#42515c]">
              A pipeline-based image editor where every change is visible, editable, and shared
              between you and AI.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/help"
              className="rounded-full border border-[#1b1f24]/15 bg-white px-4 py-2 text-sm font-medium hover:bg-[#f7fafb]"
            >
              Help
            </Link>
            <Link
              href="/studio"
              className="rounded-full bg-[#1d2730] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2f3d49]"
            >
              Try PhotoSteps
            </Link>
          </div>
        </header>

        <Section title="The Problem">
          <p className="font-medium text-[#1d2730]">Image editing is powerful… and messy.</p>
          <p>Layers, panels, hidden states, and “magic” AI edits make it hard to answer simple questions:</p>
          <ul className="list-disc pl-5">
            <li>What changed this image?</li>
            <li>Why does it look like this?</li>
            <li>How do I tweak just one part?</li>
          </ul>
          <p>Most tools hide the process.</p>
        </Section>

        <Section title="The Shift">
          <p className="font-medium text-[#1d2730]">PhotoSteps changes the model.</p>
          <p>Instead of editing pixels directly, you edit a <strong>Pipeline</strong> — a clear sequence of steps:</p>
          <pre className="overflow-auto rounded-lg bg-[#11161b] p-3 text-xs text-[#e6edf3]">
{`Read → Adjust → Blur → Tone → Blend → Export`}
          </pre>
          <p>Every effect is:</p>
          <ul className="list-disc pl-5">
            <li>explicit</li>
            <li>ordered</li>
            <li>editable</li>
            <li>reversible</li>
          </ul>
          <p>
            <strong>The image is the output.</strong>
            <br />
            <strong>The pipeline is the truth.</strong>
          </p>
        </Section>

        <Section title="What is a Pipeline?">
          <p>Think of it as:</p>
          <ul className="list-disc pl-5">
            <li>a recipe for your image</li>
            <li>code for visual transformations</li>
            <li>a step-by-step story of how your image was made</li>
          </ul>
          <p>Every step is visible:</p>
          <ul className="list-disc pl-5">
            <li>Adjust → exposure, contrast, temperature</li>
            <li>Blur → softness, motion, zoom</li>
            <li>Tone → cinematic, sepia, mono</li>
            <li>Blend → combine versions intelligently</li>
          </ul>
          <p>No hidden state. No mystery.</p>
        </Section>

        <Section title="Human + AI, Working Together">
          <p className="font-medium text-[#1d2730]">PhotoSteps is not “AI editing your image.”</p>
          <p>It’s:</p>
          <blockquote className="rounded-lg border-l-4 border-[#304252] bg-[#f5f8fa] p-3 text-[#25333f]">
            <strong>Humans and AI collaborating on the same pipeline.</strong>
          </blockquote>
          <p><strong>You</strong></p>
          <ul className="list-disc pl-5">
            <li>edit steps directly</li>
            <li>fine-tune parameters</li>
            <li>reorder, delete, refine</li>
          </ul>
          <p><strong>AI (CAT)</strong></p>
          <ul className="list-disc pl-5">
            <li>translates your words into steps</li>
            <li>suggests improvements</li>
            <li>modifies or adds steps</li>
            <li>explains what it did</li>
          </ul>
          <p><strong>Shared workspace</strong></p>
          <pre className="overflow-auto rounded-lg bg-[#11161b] p-3 text-xs text-[#e6edf3]">
{`[ ReadImage ]
[ Adjust ]
[ Blur ]
[ Tone ]
[ Blend ]
[ Export ]`}
          </pre>
          <p>You and AI both operate here.</p>
          <p>No black box.</p>
        </Section>

        <Section title="From Intent to Pipeline">
          <p>Type:</p>
          <blockquote className="rounded-lg border-l-4 border-[#304252] bg-[#f5f8fa] p-3 text-[#25333f]">
            “Make it warmer and dreamy but keep the original”
          </blockquote>
          <p>PhotoSteps builds:</p>
          <ul className="list-disc pl-5">
            <li>Adjust (warmth)</li>
            <li>Blur (softness)</li>
            <li>Blend (original + edited)</li>
          </ul>
          <p>You see it. You tweak it. You own it.</p>
        </Section>

        <Section title="Why It’s Different">
          <p><strong>Transparent</strong></p>
          <p>Every change is visible and traceable.</p>
          <p><strong>Controllable</strong></p>
          <p>Edit anything, anytime. Nothing is locked.</p>
          <p><strong>Reversible</strong></p>
          <p>Disable or remove any step instantly.</p>
          <p><strong>Composable</strong></p>
          <p>Reorder, reuse, and combine effects.</p>
          <p><strong>AI without mystery</strong></p>
          <p>AI writes steps. You decide.</p>
        </Section>

        <Section title="Graph Power, Without Graph Complexity">
          <p>Under the hood, PhotoSteps supports:</p>
          <ul className="list-disc pl-5">
            <li>branching</li>
            <li>compositing</li>
            <li>multi-input effects</li>
          </ul>
          <p>But you interact with:</p>
          <blockquote className="rounded-lg border-l-4 border-[#304252] bg-[#f5f8fa] p-3 text-[#25333f]">
            <strong>a simple list</strong>
          </blockquote>
          <p>No node spaghetti. No cognitive overload.</p>
        </Section>

        <Section title="Built for the Future of AI Tools">
          <p>Most AI tools generate results.</p>
          <p>PhotoSteps generates:</p>
          <blockquote className="rounded-lg border-l-4 border-[#304252] bg-[#f5f8fa] p-3 text-[#25333f]">
            <strong>structure you can work with</strong>
          </blockquote>
          <p>That means:</p>
          <ul className="list-disc pl-5">
            <li>consistent outputs</li>
            <li>editable workflows</li>
            <li>reusable pipelines</li>
            <li>explainable results</li>
          </ul>
        </Section>

        <Section title="Who It’s For">
          <ul className="list-disc pl-5">
            <li>Creators who want control without complexity</li>
            <li>Developers who think in systems</li>
            <li>Designers who value clarity</li>
            <li>Anyone tired of black-box AI editing</li>
          </ul>
        </Section>

        <Section title="Closing">
          <p className="text-base font-medium text-[#1d2730]">
            Stop editing pixels.
            <br />
            Start editing the process.
          </p>
          <p>
            PhotoSteps turns image editing into something you can see, understand, and shape —
            together with AI.
          </p>
          <div className="pt-2">
            <Link
              href="/studio"
              className="inline-flex rounded-full bg-[#1d2730] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2f3d49]"
            >
              Try PhotoSteps
            </Link>
          </div>
        </Section>
      </div>
    </main>
  );
}
