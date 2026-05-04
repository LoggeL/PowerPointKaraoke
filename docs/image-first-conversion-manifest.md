# Image-first conversion manifest

Goal: migrate legacy `p*/index.html` decks into `decks/<slug>/` image-first decks where every slide is a generated 16:9 image and HTML is only the presenter shell.

## Confirmed generation route

First batch used `openai/gpt-image-2` via the image generation route. Each generated slide image was returned with tool confirmation: `Generated 1 image with openai/gpt-image-2`.

## First batch

### `p1` → `decks/als-frau-im-mittelalter-ueberlebenstipps-image-first/`

Source title: `Als Frau im Mittelalter: 10 Überlebenstipps`

Generated image files:

- `slide-01-cover.png` — cover / framing slide
- `slide-02-heiratsmarkt.png` — marriage as risk-management satire
- `slide-03-kraeuterwissen.png` — herbal knowledge as suspicious competence
- `slide-04-finale.png` — finale / strategic takeaway

Presenter files:

- `index.html` — thin image presenter with keyboard, click buttons, swipe, hidden chrome, narrator hints outside the slide image
- `meta.json` — gallery metadata

## Backlog

Legacy decks still to convert:

- `p2` — Vielfältige Verwendungszwecke für Streckbänke
- `p3` — Schnelles Geld im Mittelalter: Reichtum für Jedermann?
- `p10` — Meine 10 Lieblingsfoltermethoden (Spaßedition)
- `p11` — Ein Spa in der Hölle eröffnen - Businesstipps
- `p12` — Wie werde ich böse? Tipps und Tricks
- `p13` — Erbstreit eskaliert: Tipps und Tricks
- `p14` — 10 Tipps um reichen Mann zu verführen
- `p15` — Innovationen im Bestattungswesen
- `p16` — Hilfe, mein bester Freund ist ein Plüschhase!
- `p17` — Einem Freund einen zu Lutschen ist nicht schwul weil...
- `p18` — Es ist keine Vergewaltigung wenn man vorher Überraschung schreit
- `p19` — Die kompliziertesten Sexualpraktiken der Welt
- `p20` — Politikwissenschaft ist keine Wissenschaft
- `p21` — Warum sind Frauen die besseren Bauarbeiter?
- `p22` — Warum sollten Frauen keine Lobbyisten sein?
- `p23` — Kickboxen und sexuelle Störungen: Ein unorthodoxer Einblick
- `p24` — Creepshow – Das Theaterstück, das zu weit ging
- `p25` — Die geheime Karriere von Baustellenorakeln

## Content triage notes

Some legacy titles are intentionally crude or cross current safety/taste lines. Convert them only with a satire-preserving rewrite that avoids sexual violence jokes, explicit sexual content, or graphic harm. Prefer preserving the karaoke energy while changing the premise where needed.
