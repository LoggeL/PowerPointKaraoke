# PowerPoint Karaoke

## Read this first: decks are image-first

**Do not build slide content as HTML/CSS.**

Every deck slide should be a generated image with the full slide content baked into it:

- headline
- subhead
- labels
- tables/charts
- footnotes
- slide number
- all visible slide text

The HTML file is only a lightweight presenter shell:

- show slide images
- navigation
- timer/countdown
- keyboard/mobile controls
- karaoke/narrator hints outside the slide image

Use **`openai/gpt-image-2`** for new slide images unless explicitly told otherwise.

Detailed workflow: [`docs/image-first-karaoke-decks.md`](docs/image-first-karaoke-decks.md)

## Deck shape

```text
decks/<slug>/
  index.html              # thin presenter shell only
  meta.json               # title, hints, slide metadata
  slide-01-....png        # full slide image with baked text
  slide-02-....png
  ...
```

## Generation prompt checklist

Each image prompt should explicitly include:

- 16:9 landscape keynote/conference slide
- all text baked directly into the image
- correct German spelling
- high legibility
- no extra stray text
- safe margins
- premium cinematic/editorial satire look

## Local checks

```bash
npm run check
```
