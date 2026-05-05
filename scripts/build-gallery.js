import fs from 'fs';
import path from 'path';

const repoRoot = process.cwd();
const decksDir = path.join(repoRoot, 'decks');
const outPath = path.join(repoRoot, 'index.html');

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function readMeta(deckPath, slug) {
  const metaPath = path.join(deckPath, 'meta.json');
  if (fs.existsSync(metaPath)) {
    return JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  }
  return {
    title: slug.replaceAll('-', ' '),
    description: 'Ein spielbares HTML-Deck für spontane PowerPoint-Karaoke-Runden.',
    emoji: '🎤',
    language: 'de',
    slides: []
  };
}

const decks = fs.existsSync(decksDir)
  ? fs.readdirSync(decksDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => {
        const slug = entry.name;
        const deckPath = path.join(decksDir, slug);
        const indexPath = path.join(deckPath, 'index.html');
        if (!fs.existsSync(indexPath)) return null;
        const meta = readMeta(deckPath, slug);
        const firstSlide = Array.isArray(meta.slides) && meta.slides[0]?.image ? meta.slides[0].image : null;
        return {
          slug,
          title: meta.title ?? slug,
          description: meta.description ?? 'Ein spielbares HTML-Deck für spontane PowerPoint-Karaoke-Runden.',
          emoji: meta.emoji ?? '🎤',
          language: meta.language ?? 'de',
          slideCount: Array.isArray(meta.slides) ? meta.slides.length : 0,
          firstSlide: firstSlide ? `decks/${slug}/${firstSlide}` : null
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.title.localeCompare(b.title, 'de'))
  : [];

const selectedDeck = decks.find((deck) => deck.slug === 'elternabend-als-kommunales-strafgericht') ?? decks[0] ?? null;

const thumbnails = decks.length
  ? decks
      .map((deck, index) => {
        const isActive = selectedDeck && deck.slug === selectedDeck.slug;
        const preview = deck.firstSlide
          ? `<img src="${escapeHtml(deck.firstSlide)}" alt="Slide 1 Vorschau: ${escapeHtml(deck.title)}" />`
          : `<div class="empty-preview"><span>${escapeHtml(deck.emoji)}</span></div>`;
        return `
          <a class="deck-thumb${isActive ? ' active' : ''}" href="decks/${escapeHtml(deck.slug)}/index.html" aria-label="${escapeHtml(deck.title)} öffnen">
            <span class="thumb-number">${index + 1}</span>
            <span class="thumb-frame">${preview}</span>
            <span class="thumb-title">${escapeHtml(deck.title)}</span>
          </a>`;
      })
      .join('\n')
  : `<div class="empty-state">Keine Decks gefunden.</div>`;

const selectedPreview = selectedDeck?.firstSlide
  ? `<img src="${escapeHtml(selectedDeck.firstSlide)}" alt="Große Vorschau: ${escapeHtml(selectedDeck.title)} · Slide 1" />`
  : `<div class="canvas-empty">Noch keine Slide-Vorschau verfügbar.</div>`;

const html = `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PowerPoint Karaoke Decks</title>
    <meta name="description" content="Eine kuratierte Galerie spielbarer HTML-Decks für PowerPoint Karaoke." />
    <link rel="icon" type="image/svg+xml" href="favicon.svg" />
    <style>
      :root {
        color-scheme: light;
        --ppt: #b7472a;
        --ppt-dark: #7f2a16;
        --ppt-hot: #d65a37;
        --chrome: #f7f6f5;
        --workspace: #d8d8d8;
        --pane: #f3f2f1;
        --line: #c8c6c4;
        --line-soft: #e5e2df;
        --text: #201f1e;
        --muted: #605e5c;
        --blue: #2b579a;
      }

      * { box-sizing: border-box; }

      html, body { margin: 0; min-height: 100%; }
      body {
        height: 100vh;
        overflow: hidden;
        background: #2b2b2b;
        color: var(--text);
        font-family: "Segoe UI", Arial, sans-serif;
      }
      a { color: inherit; }

      .app {
        height: 100vh;
        display: grid;
        grid-template-rows: 32px 124px minmax(0, 1fr) 25px;
        background: var(--workspace);
      }

      .titlebar {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 10px;
        padding: 0 10px;
        background: var(--ppt-dark);
        color: #fff;
        font-size: 12px;
        user-select: none;
      }
      .quick { display: flex; gap: 8px; align-items: center; opacity: .92; }
      .quick span { width: 15px; height: 15px; display: grid; place-items: center; }
      .doc-title { min-width: 0; text-align: center; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .controls { display: flex; align-items: stretch; height: 100%; }
      .controls span { width: 42px; display: grid; place-items: center; }
      .controls span:hover { background: rgba(255,255,255,.12); }

      .ribbon { background: #fff; border-bottom: 1px solid #bab7b3; box-shadow: 0 1px 3px rgba(0,0,0,.12); overflow: hidden; }
      .tabs { height: 35px; display: flex; align-items: end; gap: 1px; background: var(--ppt); color: #fff; padding-left: 8px; }
      .tab { height: 31px; display: flex; align-items: center; padding: 0 13px; border-radius: 2px 2px 0 0; text-decoration: none; font-size: 13px; white-space: nowrap; }
      .tab.file { background: rgba(0,0,0,.18); font-weight: 700; }
      .tab.active { background: #fff; color: var(--ppt-dark); font-weight: 600; }

      .toolstrip { height: 89px; display: flex; gap: 0; padding: 7px 10px 6px; overflow-x: auto; }
      .group { min-width: 96px; padding: 0 10px; border-right: 1px solid #edebe9; display: grid; grid-template-rows: 1fr auto; }
      .group.wide { min-width: 170px; }
      .group-body { display: flex; align-items: center; justify-content: center; gap: 7px; }
      .group-label { color: #605e5c; text-align: center; font-size: 10px; }
      .button { display: grid; place-items: center; gap: 2px; font-size: 10px; color: #323130; }
      .icon { width: 28px; height: 24px; display: grid; place-items: center; border: 1px solid #edebe9; border-radius: 2px; background: linear-gradient(#fff,#f5f4f2); font-size: 14px; }
      .button.big .icon { width: 42px; height: 38px; font-size: 21px; }
      .palette { display: grid; grid-template-columns: repeat(7, 14px); gap: 3px; }
      .palette span { width: 14px; height: 14px; border: 1px solid rgba(0,0,0,.18); }

      .editor {
        min-height: 0;
        display: grid;
        grid-template-columns: 286px minmax(0, 1fr);
        background: var(--workspace);
      }

      .thumb-pane {
        min-height: 0;
        overflow: auto;
        padding: 14px 10px 18px 12px;
        background: #ece9e6;
        border-right: 1px solid #b9b6b2;
      }
      .pane-title {
        margin: 0 0 10px 30px;
        color: #3b3a39;
        font-size: 12px;
        font-weight: 600;
      }

      .deck-list { display: grid; gap: 10px; }
      .deck-thumb {
        display: grid;
        grid-template-columns: 22px 124px minmax(0, 1fr);
        gap: 9px;
        align-items: center;
        padding: 7px 8px 7px 0;
        color: var(--text);
        text-decoration: none;
        border: 2px solid transparent;
        border-radius: 3px;
      }
      .deck-thumb:hover { background: rgba(255,255,255,.55); }
      .deck-thumb.active { background: #fff; border-color: var(--ppt-hot); box-shadow: 0 2px 6px rgba(0,0,0,.13); }
      .thumb-number { color: #605e5c; font-size: 12px; text-align: right; }
      .thumb-frame {
        aspect-ratio: 16 / 9;
        display: block;
        overflow: hidden;
        background: #fff;
        border: 1px solid #a19f9d;
        box-shadow: 0 2px 5px rgba(0,0,0,.16);
      }
      .thumb-frame img { width: 100%; height: 100%; display: block; object-fit: cover; }
      .empty-preview { height: 100%; display: grid; place-items: center; background: linear-gradient(135deg,#b7472a,#f6b26b); color: white; font-size: 28px; }
      .thumb-title { min-width: 0; color: #323130; font-size: 12px; line-height: 1.25; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

      .canvas-area {
        min-width: 0;
        min-height: 0;
        display: grid;
        grid-template-rows: 1fr 120px;
        background: #d9d9d9;
      }
      .slide-workspace {
        min-height: 0;
        display: grid;
        place-items: center;
        padding: clamp(22px, 4vw, 54px);
        background:
          linear-gradient(90deg, rgba(255,255,255,.28) 1px, transparent 1px),
          linear-gradient(rgba(255,255,255,.28) 1px, transparent 1px),
          #d5d5d5;
        background-size: 24px 24px;
        overflow: auto;
      }
      .slide-shell {
        width: min(100%, calc((100vh - 260px) * 16 / 9));
        max-width: 1180px;
        min-width: min(760px, 100%);
      }
      .slide-canvas {
        aspect-ratio: 16 / 9;
        background: #fff;
        border: 1px solid #8f8f8f;
        box-shadow: 0 18px 44px rgba(0,0,0,.32);
        overflow: hidden;
      }
      .slide-canvas img { width: 100%; height: 100%; display: block; object-fit: cover; }
      .canvas-empty { height: 100%; display: grid; place-items: center; color: #605e5c; }

      .notes {
        border-top: 1px solid #b9b6b2;
        background: #f7f6f5;
        padding: 12px 18px;
      }
      .notes h2 { margin: 0 0 7px; color: #605e5c; font-size: 12px; font-weight: 600; }
      .notes p { margin: 0; color: #323130; font-size: 13px; line-height: 1.35; }
      .open-button {
        display: inline-flex;
        margin-top: 9px;
        padding: 6px 11px;
        border-radius: 2px;
        background: var(--ppt);
        color: #fff;
        text-decoration: none;
        font-size: 12px;
        font-weight: 700;
      }
      .open-button:hover { background: var(--ppt-dark); }

      .statusbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 0 12px;
        background: #f3f2f1;
        border-top: 1px solid #c8c6c4;
        color: #605e5c;
        font-size: 12px;
      }
      .status-left, .status-right { display: flex; align-items: center; gap: 16px; white-space: nowrap; }
      .zoom { width: 92px; height: 3px; border-radius: 999px; background: #c8c6c4; position: relative; }
      .zoom::after { content: ""; position: absolute; left: 62%; top: 50%; width: 10px; height: 10px; border-radius: 50%; background: #605e5c; transform: translate(-50%,-50%); }

      @media (max-width: 900px) {
        body { overflow: auto; }
        .app { min-height: 100vh; height: auto; grid-template-rows: 32px auto auto 25px; }
        .toolstrip { display: none; }
        .ribbon { height: 35px; }
        .tabs { overflow-x: auto; }
        .editor { grid-template-columns: 1fr; }
        .thumb-pane { max-height: 260px; border-right: 0; border-bottom: 1px solid #b9b6b2; }
        .deck-thumb { grid-template-columns: 22px 138px minmax(0,1fr); }
        .canvas-area { grid-template-rows: auto auto; }
        .slide-workspace { padding: 18px; }
        .slide-shell { width: 100%; min-width: 0; }
      }

      @media (max-width: 620px) {
        .titlebar { grid-template-columns: 1fr auto; }
        .quick { display: none; }
        .doc-title { text-align: left; }
        .controls span { width: 30px; }
        .thumb-pane { padding-left: 8px; padding-right: 8px; }
        .deck-thumb { grid-template-columns: 20px 112px minmax(0,1fr); gap: 7px; }
        .thumb-title { font-size: 11px; }
        .notes { padding: 10px 12px; }
        .status-right { display: none; }
      }
    </style>
  </head>
  <body>
    <main class="app">
      <header class="titlebar" aria-label="PowerPoint Fensterleiste">
        <div class="quick" aria-hidden="true"><span>↶</span><span>↷</span><span>💾</span></div>
        <div class="doc-title">PowerPoint Karaoke — ${escapeHtml(selectedDeck?.title ?? 'Deck-Galerie')}.pptx</div>
        <div class="controls" aria-hidden="true"><span>—</span><span>□</span><span>×</span></div>
      </header>

      <nav class="ribbon" aria-label="PowerPoint Ribbon">
        <div class="tabs">
          <a class="tab file" href="#">Datei</a>
          <a class="tab active" href="#">Start</a>
          <a class="tab" href="#">Einfügen</a>
          <a class="tab" href="#">Entwurf</a>
          <a class="tab" href="#">Übergänge</a>
          <a class="tab" href="#">Animationen</a>
          <a class="tab" href="#">Bildschirmpräsentation</a>
          <a class="tab" href="#">Ansicht</a>
        </div>
        <div class="toolstrip" aria-hidden="true">
          <div class="group"><div class="group-body"><div class="button big"><span class="icon">📋</span><span>Einfügen</span></div></div><div class="group-label">Zwischenablage</div></div>
          <div class="group wide"><div class="group-body"><div class="button big"><span class="icon">▣</span><span>Neue Folie</span></div><div class="button"><span class="icon">⌄</span><span>Layout</span></div><div class="button"><span class="icon">↺</span><span>Zurücksetzen</span></div></div><div class="group-label">Folien</div></div>
          <div class="group wide"><div class="group-body"><div class="button"><span class="icon">B</span><span>Fett</span></div><div class="button"><span class="icon">I</span><span>Kursiv</span></div><div class="button"><span class="icon">A</span><span>Farbe</span></div><div class="button"><span class="icon">≡</span><span>Absatz</span></div></div><div class="group-label">Schriftart</div></div>
          <div class="group wide"><div class="group-body"><div class="palette"><span style="background:#b7472a"></span><span style="background:#f6b26b"></span><span style="background:#4472c4"></span><span style="background:#70ad47"></span><span style="background:#7030a0"></span><span style="background:#111"></span><span style="background:#fff"></span><span style="background:#ffd966"></span><span style="background:#9dc3e6"></span><span style="background:#a9d18e"></span><span style="background:#c55a11"></span><span style="background:#7f7f7f"></span><span style="background:#264478"></span><span style="background:#a64d79"></span></div></div><div class="group-label">Designs</div></div>
          <div class="group"><div class="group-body"><div class="button big"><span class="icon">▶</span><span>Starten</span></div></div><div class="group-label">Präsentation</div></div>
        </div>
      </nav>

      <section class="editor" aria-label="PowerPoint Editoransicht">
        <aside class="thumb-pane" aria-labelledby="thumb-title">
          <h1 class="pane-title" id="thumb-title">Präsentationen</h1>
          <div class="deck-list">
${thumbnails}
          </div>
        </aside>

        <section class="canvas-area" aria-labelledby="selected-title">
          <div class="slide-workspace">
            <div class="slide-shell">
              <div class="slide-canvas">
                ${selectedPreview}
              </div>
            </div>
          </div>
          <aside class="notes" aria-label="Notizen">
            <h2>Notizen</h2>
            <p><strong id="selected-title">${escapeHtml(selectedDeck?.title ?? 'Keine Präsentation')}</strong>${selectedDeck ? ` · Slide 1 von ${selectedDeck.slideCount || 10}. ${escapeHtml(selectedDeck.description)}` : ''}</p>
            ${selectedDeck ? `<a class="open-button" href="decks/${escapeHtml(selectedDeck.slug)}/index.html">Bildschirmpräsentation starten</a>` : ''}
          </aside>
        </section>
      </section>

      <footer class="statusbar" aria-label="Statusleiste">
        <div class="status-left"><span>Folie 1 von ${selectedDeck?.slideCount || 0}</span><span>${decks.length} Präsentationen</span><span>Deutsch</span></div>
        <div class="status-right"><span>Notizen</span><span>Kommentare</span><span class="zoom"></span><span>74%</span></div>
      </footer>
    </main>
  </body>
</html>
`;

fs.writeFileSync(outPath, html);
console.log(`Wrote ${outPath} with ${decks.length} playable deck(s).`);
