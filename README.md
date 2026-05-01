# PowerPoint Karaoke Presentations

A collection of absurd Reveal.js presentations for PowerPoint Karaoke.

## What changed

This repo no longer uses the old image-generation pipeline or the previous multi-stage harness.
New presentations are generated as self-contained slide decks:

- the model invents the slide structure from the topic itself
- the model writes the presentation HTML directly
- local placeholder visuals are created automatically for each slide
- no Replicate workflow
- no image prompt registry
- no old replacement script

## Available presentations

Open any presentation with:

```text
p[number]/index.html
```

## Generator

Create a new presentation with:

```bash
python create_presentation.py "Dein Thema"
python create_presentation.py "Dein Thema" p42
```

Required environment variable:

```bash
OPENROUTER_API_KEY=...
```

## Output structure

Each generated presentation contains:

```text
pXX/
├── content_structure.json
├── index.html
├── pXX.md
└── 01_*.svg ... 10_*.svg
```

## Notes

- Presentations are in German
- Reveal.js and Font Awesome are loaded via CDN
- The generator is intentionally decoupled from older presentation logic
- Visuals are lightweight local SVG scene cards, not AI-rendered external images

## License

MIT
