# Deck Spec

Ziel: minimale Regeln für Coding-Agents, maximale kreative Freiheit im Output.

## Prinzipien
- Jede Präsentation ist **eine eigenständige HTML-Datei**.
- Die Präsentation muss **direkt im Browser** funktionieren, ohne Build-Schritt.
- Die Inhalte der Slides sind **auf Deutsch**.
- Die Optik darf mutig, seltsam, witzig und charakterstark sein.
- Der Coding-Agent soll sichtbar kreative Entscheidungen treffen statt sterile Standardfolien zu erzeugen.

## Muss-Regeln
- Dateipfad: `decks/<slug>/index.html`
- Format: vollständiges, standalone HTML-Dokument
- Zielgerät: Desktop, primär **1920x1080**, zusätzlich robust auf **1440x900**
- Kein relevanter Content darf den sichtbaren Viewport verlassen.
- Keine überlappenden Content-Blöcke, die Text unlesbar machen.
- Navigation per Tastatur muss möglich sein (mindestens Pfeiltasten oder Leertaste/Backspace)
- Jede Präsentation braucht:
  - klaren Titel
  - mehrere Slides
  - visuelle Dramaturgie
  - konsistente Gestaltungsidee

## Bilderzeugung
- Wenn Bilder generiert werden, soll der Coding-Agent die Bildprompts explizit formulieren.
- Für Bildgenerierung den **image skill in Codex CLI** verwenden.
- Bilder dürfen nicht wie generischer Füllstoff wirken; sie sollen den Joke, die Stimmung oder die These der Folie stützen.

## Inhaltsstil
- Sprache: Deutsch
- PowerPoint-Karaoke heißt: überraschend, pointiert, leicht cursed ist okay.
- Lieber starke Folien mit klarer Aussage als überladene Wissenshalden.
- Humor, Kontrast, absurde Ernsthaftigkeit und mutige Visuals sind erwünscht.

## Validierung
Vor Abschluss muss die Präsentation visuell geprüft werden:
- Desktop-Screenshot(s) erzeugen
- Overflow/Überlappung prüfen
- Wenn nötig Layout iterieren, bis die Präsentation sauber im Viewport sitzt
