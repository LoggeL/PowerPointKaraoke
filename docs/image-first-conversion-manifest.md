# Image-first conversion manifest

Goal: migrate legacy `p*/index.html` decks into `decks/<slug>/` image-first decks where every slide is a generated 16:9 image and HTML is only the presenter shell. Preserve original `p*/` folders until explicitly removed.

## Standard

- Generator: `openai/gpt-image-2`
- Default length: 10 slides per converted deck
- Output: 16:9 PNG images with all German slide text baked into the image
- Shell: minimal presenter HTML, nav, counter, hidden hint chrome
- Tone: dark/edgy/premium editorial satire; playable as PowerPoint Karaoke

## Conversion table

| Source | Target slug | Status | Safety / rewrite treatment |
|---|---|---:|---|
| `p1` | `decks/als-frau-im-mittelalter-ueberlebenstipps-image-first/` | Converted | Expanded/reworked already; safety-preserving medieval survival satire. |
| `p2` | `decks/streckbank-als-design-thinking-tool/` | Converted | Rewrite torture premise as non-graphic absurd product innovation / medieval design-thinking furniture satire. |
| `p3` | `decks/schnelles-geld-im-mittelalter-grift-guide/` | Converted | Startup/scam/grift satire; no real instructions, fake medieval hustle taxonomy. |
| `p10` | `decks/moderne-nervmethoden-spassedition/` | Converted | Rewrite torture title into non-graphic modern annoyance taxonomy / service-design hell. |
| `p11` | `decks/spa-in-der-hoelle-businessplan/` | Backlog | Dark but non-graphic wellness/business satire; absurd heat, bureaucracy, customer journey. |
| `p12` | `decks/boese-werden-fuer-fortgeschrittene/` | Backlog | Cartoon villainy / petty bureaucracy satire; avoid real harm guidance. |
| `p13` | `decks/erbstreit-als-familien-startup/` | Backlog | Family conflict satire, escalation as governance failure; avoid legal advice. |
| `p14` | `decks/sugar-daddy-akquise-als-cringe-sales-funnel/` | Backlog | Rewrite sexist seduction angle into critique of transactional status dating and bad sales tactics. |
| `p15` | `decks/bestattungswesen-disruption-lab/` | Backlog | Dark non-graphic funeral innovation satire. |
| `p16` | `decks/plueschhase-als-co-founder/` | Backlog | Absurd friendship/therapy/startup deck; safe. |
| `p17` | `decks/fragile-maennlichkeit-im-faktencheck/` | Backlog | Rewrite explicit sexuality into satire about insecure masculinity and loophole logic; no explicit content. |
| `p18` | `decks/ueberraschung-ist-keine-einwilligung/` | Backlog | Replace rape-joke premise with explicit consent/HR compliance satire attacking the bad take, not victims. |
| `p19` | `decks/dating-coach-bullshit-bingo/` | Backlog | Rewrite explicit sexual practices into critique of overcomplicated dating/sex-advice jargon, non-explicit. |
| `p20` | `decks/politikwissenschaft-als-powerpoint-sport/` | Backlog | Academic-method envy satire; avoid attacking protected groups. |
| `p21` | `decks/baustelle-der-zukunft-ohne-stammtisch/` | Backlog | Rewrite gender-essentialist title into satire of construction stereotypes and competence theater. |
| `p22` | `decks/lobbyismus-ohne-boys-club/` | Backlog | Rewrite sexist title into satire of gatekeeping, boys-club lobbying, and performative expertise. |
| `p23` | `decks/kickboxen-und-gefuehle-ein-forschungsdesaster/` | Backlog | Rewrite sexual disorder premise into sports masculinity/emotional avoidance satire, non-explicit. |
| `p24` | `decks/creepshow-theater-eskalationshandbuch/` | Backlog | Dark theater-production satire; non-graphic, no exploitation. |
| `p25` | `decks/baustellenorakel-karrierepfad/` | Backlog | Absurd urban prophecy/career satire; safe. |
| `p26` | `decks/vw-bus-vs-wohnwagen-image-first/` | Converted | Existing image-first deck, but only 4 slides; consider later expansion if user wants full 10. |

## Batch log

- 2026-05-04: Converted batch 1: `p2` → `streckbank-als-design-thinking-tool`, `p3` → `schnelles-geld-im-mittelalter-grift-guide`, `p10` → `moderne-nervmethoden-spassedition`. `npm run check` passed.
