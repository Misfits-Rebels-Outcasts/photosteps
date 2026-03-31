import Link from "next/link";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 rounded-2xl border border-[#222]/10 bg-white p-6 shadow-sm">
      <h2 className="text-2xl tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-[#4e564f]">{children}</div>
    </section>
  );
}

function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-auto rounded-xl border border-[#222]/10">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-[#f8faf8] text-[#2a302c]">
          <tr>
            {headers.map((header) => (
              <th key={header} className="border-b border-[#222]/10 px-3 py-2 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${row[0]}-${rowIndex}`} className="odd:bg-white even:bg-[#fcfdfc]">
              {row.map((cell, cellIndex) => (
                <td key={`${cell}-${cellIndex}`} className="border-b border-[#222]/10 px-3 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-[#f5f6f4] px-6 py-10 text-[#1b1f1d] md:px-10">
      <div className="mx-auto w-full max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5e655f]">
              🧩 PhotoSteps Node Reference
            </p>
            <h1 className="mt-1 text-4xl tracking-tight md:text-5xl">PhotoSteps Help</h1>
            <p className="mt-3 text-base text-[#4e564f]">
              Each node is a step in the pipeline. Steps are executed from top to bottom to
              produce the final image. If it affects the image, it exists as a node.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/concepts"
              className="rounded-full border border-[#222]/15 bg-white px-4 py-2 text-sm font-medium hover:bg-[#fbfbfa]"
            >
              Concepts
            </Link>
            <Link
              href="/studio"
              className="rounded-full bg-[#1f2622] px-5 py-2 text-sm font-semibold text-white hover:bg-[#333d37]"
            >
              Try PhotoSteps
            </Link>
          </div>
        </header>

        <Section title="📥 1. ReadImage">
          <p><strong>Purpose</strong></p>
          <p>Loads the source image into the pipeline.</p>
          <p><strong>Type</strong></p>
          <p>Input node (must be first)</p>
          <p><strong>Parameters</strong></p>
          <DataTable
            headers={["Parameter", "Type", "Description"]}
            rows={[["source", "string", "Path or identifier of the image"]]}
          />
          <p><strong>Notes</strong></p>
          <ul className="list-disc pl-5">
            <li>There should typically be only one ReadImage</li>
            <li>All edits originate from this step</li>
          </ul>
        </Section>

        <Section title="🎛 2. Adjust">
          <p><strong>Purpose</strong></p>
          <p>Basic tonal and color corrections. This is the most commonly used node.</p>
          <p><strong>Parameters</strong></p>
          <DataTable
            headers={["Parameter", "Range", "Description"]}
            rows={[
              ["exposure", "-2 → +2", "Overall brightness (log scale)"],
              ["brightness", "-1 → +1", "Linear brightness shift"],
              ["contrast", "0 → 4", "Difference between dark and light"],
              ["saturation", "0 → 2", "Color intensity"],
              ["temperature", "-1000 → +1000", "Warm (positive) / cool (negative)"],
              ["tint", "-100 → +100", "Green ↔ magenta shift"],
            ]}
          />
          <p><strong>🤖 CAT Examples (Adjust)</strong></p>
          <ul className="list-disc pl-5">
            <li>“make it warmer” → increases temperature, may slightly increase saturation</li>
            <li>“make it brighter” → increases exposure</li>
            <li>“increase contrast” → increases contrast</li>
            <li>“make it less saturated” → decreases saturation</li>
          </ul>
        </Section>

        <Section title="🌫 3. Blur">
          <p><strong>Purpose</strong></p>
          <p>Softens the image or creates motion effects.</p>
          <p><strong>Parameters</strong></p>
          <DataTable
            headers={["Parameter", "Description"]}
            rows={[
              ["type", "gaussian, motion, zoom"],
              ["radius", "Strength of blur"],
              ["center", "Center point (for zoom blur)"],
              ["angle", "Direction (for motion blur)"],
            ]}
          />
          <p><strong>🤖 CAT Examples (Blur)</strong></p>
          <ul className="list-disc pl-5">
            <li>“make it dreamy” → type: gaussian, moderate radius</li>
            <li>“add motion blur” → type: motion, sets angle and radius</li>
            <li>“zoom blur effect” → type: zoom, uses center</li>
          </ul>
        </Section>

        <Section title="🎨 4. ColorTone">
          <p><strong>Purpose</strong></p>
          <p>Applies a global color style.</p>
          <p><strong>Parameters</strong></p>
          <DataTable
            headers={["Parameter", "Options", "Description"]}
            rows={[
              ["style", "warm, cool, cinematic, sepia, mono", "Preset tone"],
              ["intensity", "0 → 1", "Strength of effect"],
              ["highlights", "-1 → 1", "Tone bias in bright areas"],
              ["shadows", "-1 → 1", "Tone bias in dark areas"],
            ]}
          />
          <p><strong>🤖 CAT Examples (ColorTone)</strong></p>
          <ul className="list-disc pl-5">
            <li>“make it cinematic” → style: cinematic, moderate intensity</li>
            <li>“make it black and white” → style: mono</li>
            <li>“sepia look” → style: sepia</li>
          </ul>
        </Section>

        <Section title="✂️ 5. Crop">
          <p><strong>Purpose</strong></p>
          <p>Cuts the image to a region.</p>
          <p><strong>Parameters</strong></p>
          <DataTable
            headers={["Parameter", "Description"]}
            rows={[
              ["rect", "{x, y, width, height} (normalized)"],
              ["aspectRatio", "e.g. 1:1, 16:9"],
            ]}
          />
          <p><strong>🤖 CAT Examples (Crop)</strong></p>
          <ul className="list-disc pl-5">
            <li>“crop to square” → aspectRatio: 1:1</li>
          </ul>
        </Section>

        <Section title="🔄 6. Transform">
          <p><strong>Purpose</strong></p>
          <p>Applies geometric transformations.</p>
          <p><strong>Parameters</strong></p>
          <DataTable
            headers={["Parameter", "Description"]}
            rows={[
              ["rotation", "Degrees"],
              ["scaleX", "Horizontal scale"],
              ["scaleY", "Vertical scale"],
              ["translateX", "Horizontal move"],
              ["translateY", "Vertical move"],
              ["flipX", "Mirror horizontally"],
              ["flipY", "Mirror vertically"],
            ]}
          />
          <p><strong>🤖 CAT Examples (Transform)</strong></p>
          <ul className="list-disc pl-5">
            <li>“rotate slightly” → small rotation</li>
            <li>“flip horizontally” → flipX: true</li>
          </ul>
        </Section>

        <Section title="✨ 7. Sharpen">
          <p><strong>Purpose</strong></p>
          <p>Enhances detail and edges.</p>
          <p><strong>Parameters</strong></p>
          <DataTable
            headers={["Parameter", "Description"]}
            rows={[
              ["amount", "Strength of sharpening"],
              ["radius", "Area of influence"],
              ["threshold", "Edge sensitivity"],
            ]}
          />
          <p><strong>🤖 CAT Examples (Sharpen)</strong></p>
          <ul className="list-disc pl-5">
            <li>“make it sharper” → increase amount</li>
            <li>“enhance details slightly” → small increase in amount</li>
          </ul>
        </Section>

        <Section title="🌑 8. Vignette">
          <p><strong>Purpose</strong></p>
          <p>Darkens or lightens edges to draw focus.</p>
          <p><strong>Parameters</strong></p>
          <DataTable
            headers={["Parameter", "Description"]}
            rows={[
              ["intensity", "Strength (positive = darker edges)"],
              ["radius", "Size of center region"],
              ["softness", "Edge falloff"],
              ["center", "Focus point"],
            ]}
          />
          <p><strong>🤖 CAT Examples (Vignette)</strong></p>
          <ul className="list-disc pl-5">
            <li>“darken the edges” → increase intensity</li>
            <li>“draw focus to center” → increase intensity + adjust radius</li>
          </ul>
        </Section>

        <Section title="🔀 9. Blend">
          <p><strong>Purpose</strong></p>
          <p>
            Combines two images (branches in the pipeline). This is how PhotoSteps supports
            graph-like behavior inside a list.
          </p>
          <p><strong>Inputs</strong></p>
          <DataTable
            headers={["Input", "Description"]}
            rows={[
              ["imageA", "First image"],
              ["imageB", "Second image"],
              ["mask", "Optional mask"],
            ]}
          />
          <p><strong>Parameters</strong></p>
          <DataTable
            headers={["Parameter", "Options", "Description"]}
            rows={[
              ["mode", "normal, multiply, screen, overlay, softLight", "Blend mode"],
              ["opacity", "0 → 1", "Blend strength"],
            ]}
          />
          <p><strong>🤖 CAT Examples (Blend)</strong></p>
          <ul className="list-disc pl-5">
            <li>“keep the original” → create branch, blend original with edited version</li>
            <li>“mix with original” → use Blend with moderate opacity</li>
          </ul>
        </Section>

        <Section title="📤 10. ExportImage">
          <p><strong>Purpose</strong></p>
          <p>Outputs the final image.</p>
          <p><strong>Type</strong></p>
          <p>Output node (must be last)</p>
          <p><strong>Parameters</strong></p>
          <DataTable
            headers={["Parameter", "Options", "Description"]}
            rows={[
              ["format", "jpeg, png, webp", "Output format"],
              ["quality", "0 → 1", "Compression quality"],
            ]}
          />
        </Section>

        <Section title="🧠 How CAT Uses These Nodes">
          <p>CAT (Collaborative Agent Transform) translates user intent into node operations.</p>
          <p><strong>Example</strong></p>
          <p>User:</p>
          <blockquote className="rounded-lg border-l-4 border-[#3a433d] bg-[#f6f8f5] p-3 text-[#2a332e]">
            “make it warmer and dreamy but keep the original”
          </blockquote>
          <p>CAT builds:</p>
          <ul className="list-disc pl-5">
            <li>Adjust → increase temperature</li>
            <li>Blur → add softness</li>
            <li>Blend → combine with original</li>
          </ul>
        </Section>

        <Section title="🔄 Node Ordering (Recommended)">
          <p>Typical pipeline order:</p>
          <pre className="overflow-auto rounded-lg bg-[#11161b] p-3 text-xs text-[#e6edf3]">
{`ReadImage
→ Crop
→ Transform
→ Adjust
→ Blur
→ ColorTone
→ Vignette
→ Sharpen
→ Blend
→ ExportImage`}
          </pre>
        </Section>

        <Section title="🧭 Final Principle">
          <p>
            Every node answers a simple question:
            <br />
            <strong>What transformation is applied at this step?</strong>
          </p>
          <p>
            And together:
            <br />
            <strong>The pipeline tells the complete story of the image.</strong>
          </p>
        </Section>
      </div>
    </main>
  );
}
