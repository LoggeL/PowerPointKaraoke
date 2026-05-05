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
    language: 'de'
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
        return {
          slug,
          title: meta.title ?? slug,
          description: meta.description ?? 'Ein spielbares HTML-Deck für spontane PowerPoint-Karaoke-Runden.',
          emoji: meta.emoji ?? '🎤',
          language: meta.language ?? 'de'
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.title.localeCompare(b.title, 'de'))
  : [];

const cards = decks.length
  ? decks
      .map(
        (deck, index) => `
        <article class="deck-card" style="--i: ${index}">
          <a href="decks/${escapeHtml(deck.slug)}/index.html" aria-label="${escapeHtml(deck.title)} öffnen">
            <div class="slide-thumb" aria-hidden="true">
              <div class="thumb-ribbon"></div>
              <div class="thumb-body">
                <span class="deck-emoji">${escapeHtml(deck.emoji)}</span>
                <span class="deck-language">${escapeHtml(deck.language)}</span>
              </div>
            </div>
            <div class="deck-copy">
              <h2>${escapeHtml(deck.title)}</h2>
              <p>${escapeHtml(deck.description)}</p>
              <span class="deck-action">Öffnen</span>
            </div>
          </a>
        </article>`
      )
      .join('\n')
  : `
        <article class="empty-state">
          <h2>Noch keine spielbaren Decks gefunden</h2>
          <p>Lege ein Deck unter <code>decks/&lt;slug&gt;/index.html</code> ab und starte danach <code>npm run build:gallery</code>.</p>
        </article>`;

const recentList = decks.slice(0, 7).map((deck) => `
            <li><a href="decks/${escapeHtml(deck.slug)}/index.html"><span>${escapeHtml(deck.emoji)}</span>${escapeHtml(deck.title)}</a></li>`).join('');

const deckLabel = decks.length === 1 ? 'Präsentation' : 'Präsentationen';

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
        --ppt-orange: #b7472a;
        --ppt-orange-dark: #8f2e18;
        --ppt-orange-hot: #d35230;
        --bg: #f3f2f1;
        --canvas: #ffffff;
        --line: #d0d0d0;
        --line-soft: #e8e6e3;
        --text: #252423;
        --muted: #605e5c;
        --sidebar: #faf9f8;
        --shadow: 0 18px 48px rgba(0, 0, 0, 0.16);
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        min-height: 100vh;
        background: var(--bg);
        color: var(--text);
        font-family: "Segoe UI", Arial, sans-serif;
      }

      a { color: inherit; }

      .window {
        min-height: 100vh;
        display: grid;
        grid-template-rows: auto auto 1fr;
      }

      .titlebar {
        height: 34px;
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 12px;
        padding: 0 12px;
        background: var(--ppt-orange-dark);
        color: white;
        font-size: 0.82rem;
        user-select: none;
      }

      .quick-access { display: flex; align-items: center; gap: 8px; opacity: 0.95; }
      .qa-icon { width: 16px; height: 16px; display: grid; place-items: center; border-radius: 2px; font-size: 0.72rem; }
      .doc-title { text-align: center; font-weight: 600; opacity: 0.95; }
      .window-controls { display: flex; gap: 1px; }
      .window-controls span { width: 38px; height: 24px; display: grid; place-items: center; border-radius: 2px; }
      .window-controls span:hover { background: rgba(255,255,255,0.12); }

      .ribbon {
        background: #fff;
        border-bottom: 1px solid #c8c6c4;
        box-shadow: 0 2px 6px rgba(0,0,0,0.08);
      }

      .tabs {
        height: 37px;
        display: flex;
        align-items: end;
        gap: 1px;
        padding: 0 12px;
        background: var(--ppt-orange);
        color: white;
      }

      .tab {
        padding: 10px 14px 9px;
        font-size: 0.86rem;
        text-decoration: none;
        border-radius: 3px 3px 0 0;
        opacity: 0.92;
      }

      .tab.active {
        background: #fff;
        color: var(--ppt-orange-dark);
        opacity: 1;
        font-weight: 600;
      }

      .tab.file {
        background: rgba(0,0,0,0.18);
        margin-right: 2px;
        font-weight: 700;
      }

      .commands {
        min-height: 92px;
        display: flex;
        align-items: stretch;
        gap: 0;
        padding: 8px 16px 7px;
        overflow-x: auto;
      }

      .command-group {
        min-width: 110px;
        display: grid;
        grid-template-rows: 1fr auto;
        padding: 0 12px;
        border-right: 1px solid #edebe9;
      }

      .command-row { display: flex; align-items: center; justify-content: center; gap: 8px; }
      .command-label { color: #605e5c; text-align: center; font-size: 0.68rem; }
      .command-button { display: grid; place-items: center; gap: 3px; color: #323130; font-size: 0.72rem; }
      .command-icon { width: 32px; height: 28px; display: grid; place-items: center; border: 1px solid #edebe9; border-radius: 3px; background: linear-gradient(#fff, #f5f4f2); font-size: 1rem; }
      .large .command-icon { width: 46px; height: 42px; font-size: 1.35rem; }
      .swatches { display: grid; grid-template-columns: repeat(5, 16px); gap: 3px; }
      .swatches span { width: 16px; height: 16px; border: 1px solid rgba(0,0,0,0.18); }

      .workspace {
        display: grid;
        grid-template-columns: 280px 1fr;
        min-height: 0;
      }

      .backstage {
        background: var(--sidebar);
        border-right: 1px solid #d8d6d3;
        padding: 26px 18px;
      }

      .brand-lockup {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 28px;
      }

      .ppt-logo {
        width: 52px;
        height: 52px;
        display: grid;
        place-items: center;
        border-radius: 8px;
        background: linear-gradient(135deg, #c9492d, #7b2817);
        color: #fff;
        font-size: 1.8rem;
        font-weight: 800;
        box-shadow: 0 12px 24px rgba(183, 71, 42, 0.28);
      }

      .brand-lockup h1 {
        margin: 0;
        font-size: 1.3rem;
        line-height: 1.05;
        letter-spacing: -0.02em;
      }

      .brand-lockup p { margin: 4px 0 0; color: var(--muted); font-size: 0.82rem; }

      .side-nav { display: grid; gap: 3px; margin-bottom: 28px; }
      .side-nav a {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 11px;
        border-radius: 3px;
        color: #323130;
        text-decoration: none;
        font-size: 0.94rem;
      }
      .side-nav a.active { background: #f3ded7; color: var(--ppt-orange-dark); border-left: 4px solid var(--ppt-orange); font-weight: 700; }
      .side-nav a:not(.active):hover { background: #edebe9; }

      .recent h2 {
        margin: 0 0 10px;
        color: #323130;
        font-size: 0.78rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      .recent ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 2px; }
      .recent a {
        display: flex;
        align-items: center;
        gap: 9px;
        min-width: 0;
        padding: 7px 4px;
        color: #605e5c;
        text-decoration: none;
        font-size: 0.8rem;
        line-height: 1.25;
      }
      .recent a:hover { color: var(--ppt-orange-dark); text-decoration: underline; }

      .main-stage {
        min-width: 0;
        padding: 30px clamp(18px, 4vw, 48px) 48px;
        background:
          radial-gradient(circle at 85% 8%, rgba(183, 71, 42, 0.10), transparent 24rem),
          linear-gradient(180deg, #fff 0%, #f3f2f1 100%);
      }

      .start-head {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        align-items: end;
        margin-bottom: 22px;
      }

      .start-head h2 {
        margin: 0;
        font-size: clamp(1.75rem, 3vw, 2.55rem);
        font-weight: 600;
        letter-spacing: -0.035em;
      }

      .start-head p { margin: 7px 0 0; color: var(--muted); max-width: 760px; line-height: 1.45; }

      .searchbox {
        width: min(330px, 100%);
        height: 36px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 12px;
        border: 1px solid #c8c6c4;
        border-radius: 2px;
        background: #fff;
        color: #605e5c;
        font-size: 0.86rem;
        box-shadow: inset 0 1px 2px rgba(0,0,0,0.04);
      }

      .template-strip {
        display: grid;
        grid-template-columns: repeat(4, minmax(120px, 1fr));
        gap: 14px;
        margin: 0 0 28px;
      }

      .template {
        min-height: 96px;
        display: grid;
        align-content: end;
        padding: 12px;
        border: 1px solid #d8d6d3;
        border-radius: 2px;
        background: #fff;
        box-shadow: 0 4px 14px rgba(0,0,0,0.06);
        position: relative;
        overflow: hidden;
        font-size: 0.82rem;
        font-weight: 600;
      }
      .template::before { content: ""; position: absolute; inset: 0; background: linear-gradient(135deg, var(--a), var(--b)); opacity: 0.9; }
      .template span { position: relative; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.28); }

      .content-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 270px;
        gap: 24px;
        align-items: start;
      }

      .deck-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
        gap: 18px;
      }

      .deck-card {
        background: transparent;
      }

      .deck-card a {
        display: grid;
        gap: 10px;
        text-decoration: none;
        color: inherit;
      }

      .slide-thumb {
        aspect-ratio: 16 / 9;
        border: 1px solid #c8c6c4;
        background: #fff;
        box-shadow: 0 8px 22px rgba(0,0,0,0.14);
        transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease;
        position: relative;
        overflow: hidden;
      }

      .deck-card a:hover .slide-thumb {
        transform: translateY(-3px);
        border-color: var(--ppt-orange);
        box-shadow: 0 15px 30px rgba(0,0,0,0.18);
      }

      .thumb-ribbon {
        position: absolute;
        inset: 0;
        background:
          linear-gradient(160deg, rgba(183,71,42,0.96), rgba(111,39,27,0.92) 48%, rgba(245,177,110,0.9)),
          radial-gradient(circle at 82% 20%, rgba(255,255,255,0.4), transparent 9rem);
      }

      .thumb-body {
        position: relative;
        height: 100%;
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: end;
        padding: 14px;
      }

      .deck-emoji {
        width: 52px;
        height: 52px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: rgba(255,255,255,0.2);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255,255,255,0.34);
        font-size: 1.8rem;
      }

      .deck-language {
        align-self: start;
        padding: 4px 7px;
        border-radius: 2px;
        background: rgba(255,255,255,0.82);
        color: var(--ppt-orange-dark);
        font-size: 0.68rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }

      .deck-copy {
        padding: 0 2px 8px;
      }

      .deck-copy h2 {
        margin: 0 0 5px;
        font-size: 0.98rem;
        line-height: 1.22;
        font-weight: 600;
        color: #201f1e;
      }

      .deck-copy p {
        margin: 0;
        color: #605e5c;
        font-size: 0.78rem;
        line-height: 1.36;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .deck-action {
        display: inline-flex;
        margin-top: 9px;
        color: var(--ppt-orange-dark);
        font-size: 0.8rem;
        font-weight: 700;
      }

      .info-panel {
        border: 1px solid #d8d6d3;
        background: #fff;
        box-shadow: 0 8px 20px rgba(0,0,0,0.07);
      }
      .info-panel h2 {
        margin: 0;
        padding: 13px 14px;
        border-bottom: 1px solid #edebe9;
        font-size: 0.92rem;
        font-weight: 600;
      }
      .info-panel dl { margin: 0; padding: 14px; display: grid; gap: 12px; }
      .info-panel div { display: flex; justify-content: space-between; gap: 12px; }
      .info-panel dt { color: #605e5c; font-size: 0.8rem; }
      .info-panel dd { margin: 0; color: #201f1e; font-size: 0.82rem; font-weight: 600; text-align: right; }

      .empty-state {
        grid-column: 1 / -1;
        padding: 30px;
        border: 1px dashed #c8c6c4;
        background: #fff;
        color: var(--muted);
      }

      code { padding: 0.12em 0.36em; border-radius: 0.2em; background: #edebe9; color: #201f1e; }

      @media (max-width: 980px) {
        .workspace { display: block; width: 100%; }
        .backstage { display: none; }
        .content-row { grid-template-columns: 1fr; }
        .info-panel { display: none; }
      }

      @media (max-width: 720px) {
        .commands { display: none; }
        .window { width: 100%; overflow: hidden; }
        .titlebar { width: 100%; grid-template-columns: minmax(0, 1fr) auto; }
        .quick-access { display: none; }
        .doc-title { text-align: left; }
        .window-controls { flex: 0 0 auto; }
        .window-controls span { width: 30px; }
        .ribbon { width: 100%; overflow: hidden; }
        .tabs { width: 100%; overflow-x: auto; overflow-y: hidden; padding-right: 12px; }
        .start-head { display: block; }
        .searchbox { margin-top: 16px; }
        .template-strip { grid-template-columns: repeat(2, minmax(120px, 1fr)); }
        .main-stage { width: 100vw; padding: 22px 14px 34px; overflow: hidden; }
        .start-head, .start-head > div, .start-head h2, .start-head p, .template-strip, .content-row, .deck-grid { width: 100%; max-width: 100%; }
        .template-strip { grid-template-columns: 1fr; }
        .deck-grid { grid-template-columns: 1fr; }
      }
    </style>
  </head>
  <body>
    <div class="window">
      <header class="titlebar" aria-label="PowerPoint Fensterleiste">
        <div class="quick-access" aria-hidden="true">
          <span class="qa-icon">↶</span><span class="qa-icon">↷</span><span class="qa-icon">💾</span>
        </div>
        <div class="doc-title">PowerPoint Karaoke Decks.pptx</div>
        <div class="window-controls" aria-hidden="true"><span>—</span><span>□</span><span>×</span></div>
      </header>

      <nav class="ribbon" aria-label="PowerPoint Ribbon">
        <div class="tabs">
          <a class="tab file" href="#">Datei</a>
          <a class="tab active" href="#">Start</a>
          <a class="tab" href="#">Einfügen</a>
          <a class="tab" href="#">Entwurf</a>
          <a class="tab" href="#">Übergänge</a>
          <a class="tab" href="#">Bildschirmpräsentation</a>
          <a class="tab" href="#">Überprüfen</a>
          <a class="tab" href="#">Ansicht</a>
        </div>
        <div class="commands" aria-hidden="true">
          <div class="command-group"><div class="command-row"><div class="command-button large"><span class="command-icon">📋</span><span>Einfügen</span></div></div><div class="command-label">Zwischenablage</div></div>
          <div class="command-group"><div class="command-row"><div class="command-button large"><span class="command-icon">▣</span><span>Neue Folie</span></div><div class="command-button"><span class="command-icon">⌄</span><span>Layout</span></div></div><div class="command-label">Folien</div></div>
          <div class="command-group"><div class="command-row"><div class="command-button"><span class="command-icon">B</span><span>Fett</span></div><div class="command-button"><span class="command-icon">I</span><span>Kursiv</span></div><div class="command-button"><span class="command-icon">A</span><span>Farbe</span></div></div><div class="command-label">Schriftart</div></div>
          <div class="command-group"><div class="command-row"><div class="swatches"><span style="background:#b7472a"></span><span style="background:#f6b26b"></span><span style="background:#4472c4"></span><span style="background:#70ad47"></span><span style="background:#7030a0"></span><span style="background:#fff"></span><span style="background:#111"></span><span style="background:#ffd966"></span><span style="background:#a9d18e"></span><span style="background:#9dc3e6"></span></div></div><div class="command-label">Designvarianten</div></div>
          <div class="command-group"><div class="command-row"><div class="command-button large"><span class="command-icon">▶</span><span>Von Beginn an</span></div></div><div class="command-label">Präsentieren</div></div>
        </div>
      </nav>

      <main class="workspace">
        <aside class="backstage" aria-label="Datei Navigation">
          <div class="brand-lockup">
            <div class="ppt-logo" aria-hidden="true">P</div>
            <div>
              <h1>PowerPoint<br />Karaoke</h1>
              <p>Lokale Deck-Galerie</p>
            </div>
          </div>
          <nav class="side-nav" aria-label="PowerPoint Startnavigation">
            <a class="active" href="#"><span>🏠</span> Start</a>
            <a href="#"><span>🕘</span> Zuletzt verwendet</a>
            <a href="#"><span>📁</span> Öffnen</a>
            <a href="#"><span>✨</span> Neu</a>
            <a href="#"><span>🖨️</span> Exportieren</a>
          </nav>
          <section class="recent" aria-labelledby="recent-title">
            <h2 id="recent-title">Zuletzt verwendete Decks</h2>
            <ul>${recentList}</ul>
          </section>
        </aside>

        <section class="main-stage" aria-labelledby="page-title">
          <div class="start-head">
            <div>
              <h2 id="page-title">Neue Präsentation auswählen</h2>
              <p>Spontane Vorträge, absurde Themen, null Vorbereitung — jetzt im Office-Chrome, damit der Unsinn offiziell wirkt.</p>
            </div>
            <div class="searchbox" role="search" aria-label="Suchfeld Attrappe"><span aria-hidden="true">🔎</span> Präsentationen suchen</div>
          </div>

          <div class="template-strip" aria-label="PowerPoint Vorlagen">
            <div class="template" style="--a:#b7472a;--b:#ef8b61"><span>Leere Präsentation</span></div>
            <div class="template" style="--a:#2f5597;--b:#9dc3e6"><span>Konferenz-Drama</span></div>
            <div class="template" style="--a:#7030a0;--b:#c9a0dc"><span>Executive Chaos</span></div>
            <div class="template" style="--a:#385723;--b:#a9d18e"><span>Karaoke-Modus</span></div>
          </div>

          <div class="content-row">
            <section aria-label="Decks auswählen">
              <div class="deck-grid">
${cards}
              </div>
            </section>
            <aside class="info-panel" aria-label="Dokumentinformationen">
              <h2>Eigenschaften</h2>
              <dl>
                <div><dt>Dateityp</dt><dd>HTML Decks</dd></div>
                <div><dt>Anzahl</dt><dd>${decks.length} ${deckLabel}</dd></div>
                <div><dt>Format</dt><dd>16:9</dd></div>
                <div><dt>Sprache</dt><dd>Deutsch</dd></div>
                <div><dt>Status</dt><dd>Bereit zum Fremdschämen</dd></div>
              </dl>
            </aside>
          </div>
        </section>
      </main>
    </div>
  </body>
</html>
`;

fs.writeFileSync(outPath, html);
console.log(`Wrote ${outPath} with ${decks.length} playable deck(s).`);
