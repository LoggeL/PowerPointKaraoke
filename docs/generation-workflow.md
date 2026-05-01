# Generation Workflow

## Ziel
Dieser Repo ist absichtlich simpel: Coding-Agents bauen rohe HTML-Decks direkt, ohne App-Framework und ohne komplizierte Content-Pipeline.

## Standardablauf für neue Decks
1. Thema festlegen
2. Deutschen Slide-Arc entwerfen
3. Falls sinnvoll: Bildprompts formulieren
4. Bilder mit dem **image skill in Codex CLI** generieren
5. `decks/<slug>/index.html` als standalone Präsentation bauen
6. Galerie mit `npm run build:gallery` aktualisieren
7. Desktop-Validierung mit `npm run validate:decks` ausführen
8. Screenshots prüfen und Deck ggf. nachschärfen

## Erwartung an Coding-Agents
- Nicht nur Text umformatieren.
- Eine visuelle Idee wählen.
- Rhythmus zwischen dichten und luftigen Folien erzeugen.
- Die Präsentation soll wie ein absichtlich gebautes Stück wirken, nicht wie HTML-Müll.

## Output-Konvention
Jedes Deck lebt unter:
- `decks/<slug>/index.html`

Optional zusätzlich:
- `decks/<slug>/meta.json`
- `decks/<slug>/assets/*`

## Meta-Empfehlung
Wenn `meta.json` vorhanden ist, sollte es etwa so aussehen:

```json
{
  "title": "VW Bus vs. Wohnwagen",
  "description": "Eine cursed Vergleichsstudie über Freiheit, Spießigkeit und fragwürdige Lebensentscheidungen.",
  "emoji": "🚌",
  "language": "de"
}
```

## Qualitätsbar
- Auf 1920x1080 muss der Deck sauber aussehen.
- Auf 1440x900 darf nichts kaputtgehen.
- Keine unkontrollierten Scrollhöllen.
- Keine Textwände ohne Rhythmus.
- Keine generischen AI-Bildprompts ohne Gedanken.
