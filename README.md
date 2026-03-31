# PhotoSteps

PhotoSteps is a pipeline-based photo editor built with Next.js. Instead of applying hidden edits, it represents image changes as explicit, ordered steps you can inspect, tweak, reorder, and share.

The app also includes CAT-assisted editing: you write natural-language instructions (for example, "make it warmer and dreamy"), and PhotoSteps proposes structured pipeline changes rather than black-box outputs.

## What PhotoSteps Does

- Converts text instructions into proposed image-editing pipelines.
- Lets you edit a step list (add, move, duplicate, disable, delete).
- Supports direct parameter editing for each node.
- Supports branching/multi-input edits (for example `Blend`).
- Renders previews in-browser and exports PNG previews.
- Saves/opens pipeline JSON files.
- Generates handoff links by encoding pipeline state into URL tokens.

## Pipeline Examples

### Example 1: Warm + Dreamy + Keep Original

```json
{
  "pipelineVersion": "2.0",
  "app": "PhotoSteps",
  "engine": "CAT",
  "steps": [
    { "id": 1, "node": "ReadImage", "params": { "source": "portrait.jpg" } },
    { "id": 2, "node": "Adjust", "input": 1, "params": { "temperature": 300, "contrast": 1.1 } },
    { "id": 3, "node": "Blur", "input": 2, "params": { "type": "gaussian", "radius": 4 } },
    {
      "id": 4,
      "node": "Blend",
      "inputs": { "imageA": 1, "imageB": 3, "mask": null },
      "params": { "mode": "softLight", "opacity": 0.4 }
    },
    { "id": 5, "node": "ExportImage", "input": 4, "params": { "format": "jpeg", "quality": 0.9 } }
  ]
}
```

### Example 2: Cinematic Tone + Vignette

```json
{
  "pipelineVersion": "2.0",
  "app": "PhotoSteps",
  "engine": "CAT",
  "steps": [
    { "id": 1, "node": "ReadImage", "params": { "source": "street.jpg" } },
    { "id": 2, "node": "ColorTone", "input": 1, "params": { "style": "cinematic", "intensity": 0.45 } },
    { "id": 3, "node": "Adjust", "input": 2, "params": { "contrast": 1.15, "saturation": 0.92 } },
    { "id": 4, "node": "Vignette", "input": 3, "params": { "intensity": 0.22, "radius": 0.82, "softness": 0.6 } },
    { "id": 5, "node": "ExportImage", "input": 4, "params": { "format": "jpeg", "quality": 0.92 } }
  ]
}
```

## Clone and Run

### 1) Clone the repository

```bash
git clone <YOUR_REPO_URL>
cd PhotoSteps/photosteps-web
```

### 2) Install dependencies

```bash
npm install
```

### 3) Start the development server

```bash
npm run dev
```

### 4) Open the app

Visit [http://localhost:3000](http://localhost:3000)

## Quick Demo

1. Open `/studio`.
2. Import an image in the **Viewer** panel.
3. Paste one prompt into the top instruction box.
4. Click **Apply CAT**.
5. Inspect proposed steps, tweak params, then export PNG.

Try these prompts:

- `make it warmer and softer but keep the original`
- `add a cinematic look with slightly stronger contrast`
- `crop to square and sharpen slightly`
- `blend with original at low opacity`
- `make it cooler and darker at the edges`

## Main Routes

- `/` - landing page
- `/studio` - interactive PhotoSteps editor
- `/help` - node reference
- `/concepts` - product concepts and model

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- In-repo pipeline + CAT logic under `src/lib/*`

## Notes

- The included sample pipeline schema is in `src/lib/schema/photosteps-v2.schema.json`.
- A baseline example pipeline is in `src/lib/schema/example.pipeline.json`.
