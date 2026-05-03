# Image-First PowerPoint Karaoke Decks

## Non-negotiable rule

**Slides are images. Slide content is not HTML.**

Use **`openai/gpt-image-2`** to generate each slide as a complete 16:9 image with all visible slide text baked into the image.

HTML is only the presenter shell:

- image display
- navigation
- countdown/timer
- slide switching
- keyboard/mobile controls
- karaoke/narrator hints outside the image

## Required deck structure

```text
/decks/<slug>/
  index.html              # thin image presenter
  meta.json               # title + slide metadata + narrator hints
  slide-01-....png        # full slide image with baked text
  slide-02-....png
  ...
```

## GPT Image 2 prompt checklist

Every slide prompt must say:

- 16:9 landscape
- keynote / conference slide aesthetic
- **all text baked directly into the image**
- correct German spelling
- high legibility
- no extra stray text
- safe margins
- premium cinematic/editorial satire look
- strong composition supporting the copy

Use dark translucent panels behind text when needed for readability.

## Slide copy style

Good Karaoke slides have:

- concrete claims
- overconfident framing
- fake scientific seriousness
- absurd categories that still feel plausible
- social observation and friction

Avoid:

- neutral copy
- generic business filler
- polite blandness
- slides that explain too much in HTML instead of the image

## Narrator hints

Hints should tease the presenter, not merely help them.

Tone:

- lightly frech
- not insulting
- pushes improvisation
- treats nonsense as if it deserves maximal dignity

Examples:

- „Verkauf das jetzt mit der Autorität eines Menschen, der nie an sich gezweifelt hat.“
- „Kling so, als wäre diese völlig erfundene Kategorie international anerkannt.“
- „Wenn du hier zögerst, verliert die Folie sofort ihren wissenschaftlichen Glanz.“
- „Sag das mit der Ruhe eines Experten, der exakt nichts beweisen kann.“

## Standard workflow

1. Define topic and tone.
2. Write the slide list.
3. Define exact baked text per slide.
4. Generate images with `openai/gpt-image-2`.
5. Save images into the deck folder.
6. Keep `index.html` as a thin image presenter.
7. Add narrator hints outside the slide image.
8. Validate desktop and mobile rendering.
9. Optimize image assets if needed.
10. Run `npm run check` before pushing.
