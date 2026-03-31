# PhotoSteps

Stop using AI that edits your photos.  
Start using AI that builds your editing system.

## ⚠️ The Problem

AI photo tools today are broken:

- You type -> it generates -> you get a result
- You don't know what happened
- You can't tweak it properly
- You can't reuse it

It's fast.  
But it's opaque, fragile, and disposable.

## 💡 The Shift

PhotoSteps flips the model:

AI doesn't generate the image.  
AI generates the pipeline.

## 🧩 What is PhotoSteps?

A pipeline-first image editor where:

- Every edit = a node
- Every workflow = a pipeline
- The pipeline = the truth
- PhotoSteps Studio gives humans a visual editor to inspect and directly edit every pipeline step

No hidden layers.  
No mystery sliders.  
No "magic."  
Just a system you can see, edit, and own.

## 🧠 This is the killer feature

You type:

`make it warmer and dreamy`

Instead of getting a baked image...  
You get:

```json
[
  { "node": "temperature", "value": 12 },
  { "node": "softGlow", "radius": 8, "intensity": 0.4 },
  { "node": "toneCurve", "preset": "dreamy" }
]
```

AI becomes a pipeline generator.  
You become the editor of the system.

## 🤝 Human × AI (not Human vs AI)

This is where it gets interesting.

Both you and AI operate on the same structure.

- You describe intent
- AI proposes structure
- You refine the structure in PhotoSteps Studio (step-by-step, with full control)

No overrides.  
No black box.  
No starting over.  
Just continuous collaboration.

## 🔥 Why this is different

Most tools optimize for:

`Get a result fast`

PhotoSteps optimizes for:

`Build something reusable`

That unlocks:

- ♻️ Reuse the exact look on any image
- 🧪 Experiment by swapping steps
- 🔍 Debug bad edits instantly
- 📦 Share looks as pipelines (not screenshots)

## 🧠 The idea in one line

PhotoSteps is "Markdown for image editing" + AI.

## ⚡ Example flow

1. Load image
2. Type: `cinematic, soft, slightly warm`
3. AI generates pipeline
4. You tweak values
5. You reorder steps
6. You save the pipeline

## 🏗 Tech

- Next.js
- TypeScript
- WebGL rendering
- Lightweight, mostly client-side

## 🧱 Schema and Render Contract

PhotoSteps includes a formal schema and render contract for nodes and pipelines.  
That structure can be used to generate or port node implementations to other native GPU backends, including Apple Metal.

- Schema: [`src/lib/schema/photosteps-v2.schema.json`](./src/lib/schema/photosteps-v2.schema.json)
- Node catalog: [`src/lib/schema/nodes.full.json`](./src/lib/schema/nodes.full.json)

## 🧨 Hot take

AI tools that hide their process will feel outdated.

The future is:

AI that exposes structure.

## 🔮 What this becomes

- A universal format for image editing
- A shared library of looks
- A programmable layer for creativity

## ⭐ If this clicks

- Star the repo
- Fork it
- Break it
- Build your own nodes
- Push the idea further

## 🐾 Final thought

Don't ask AI for better images.  
Ask AI for better systems to make images.

## Clone and Install

```bash
git clone https://github.com/Misfits-Rebels-Outcasts/photosteps.git
cd photosteps/photosteps-web
npm install
npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)
