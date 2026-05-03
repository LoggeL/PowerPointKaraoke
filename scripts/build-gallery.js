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
            <div class="deck-topline">
              <span class="deck-emoji" aria-hidden="true">${escapeHtml(deck.emoji)}</span>
              <span class="deck-language">${escapeHtml(deck.language)}</span>
            </div>
            <h2>${escapeHtml(deck.title)}</h2>
            <p>${escapeHtml(deck.description)}</p>
            <span class="deck-action">Deck starten <span aria-hidden="true">→</span></span>
          </a>
        </article>`
      )
      .join('\n')
  : `
        <article class="empty-state">
          <h2>Noch keine spielbaren Decks gefunden</h2>
          <p>Lege ein Deck unter <code>decks/&lt;slug&gt;/index.html</code> ab und starte danach <code>npm run build:gallery</code>.</p>
        </article>`;

const deckLabel = decks.length === 1 ? 'spielbares Deck' : 'spielbare Decks';

const html = `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PowerPoint Karaoke Decks</title>
    <meta
      name="description"
      content="Eine kuratierte Galerie spielbarer HTML-Decks für PowerPoint Karaoke."
    />
    <link rel="icon" type="image/svg+xml" href="favicon.svg" />
    <style>
      :root {
        color-scheme: dark;
        --bg: #090a12;
        --bg-soft: #121527;
        --panel: rgba(255, 255, 255, 0.075);
        --panel-strong: rgba(255, 255, 255, 0.12);
        --line: rgba(255, 255, 255, 0.14);
        --text: #f8fbff;
        --muted: #b7c1d9;
        --accent: #7cf7d4;
        --accent-2: #9aa7ff;
        --accent-3: #ffb86b;
        --shadow: 0 24px 80px rgba(0, 0, 0, 0.38);
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background:
          radial-gradient(circle at 12% 8%, rgba(124, 247, 212, 0.22), transparent 34rem),
          radial-gradient(circle at 92% 0%, rgba(154, 167, 255, 0.25), transparent 30rem),
          linear-gradient(135deg, #080911 0%, #121527 52%, #0d101b 100%);
        color: var(--text);
      }

      body::before {
        content: "";
        position: fixed;
        inset: 0;
        pointer-events: none;
        background-image:
          linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
        background-size: 42px 42px;
        mask-image: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent 70%);
      }

      a { color: inherit; }

      .shell {
        width: min(1180px, calc(100% - 40px));
        margin: 0 auto;
        padding: 56px 0 64px;
      }

      .hero {
        position: relative;
        overflow: hidden;
        padding: clamp(28px, 6vw, 64px);
        border: 1px solid var(--line);
        border-radius: 34px;
        background: linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.045));
        box-shadow: var(--shadow);
      }

      .hero::after {
        content: "🎤";
        position: absolute;
        right: clamp(20px, 6vw, 70px);
        top: 28px;
        font-size: clamp(4rem, 13vw, 10rem);
        opacity: 0.13;
        transform: rotate(-10deg);
      }

      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 8px 13px;
        border: 1px solid rgba(124, 247, 212, 0.34);
        border-radius: 999px;
        background: rgba(124, 247, 212, 0.1);
        color: var(--accent);
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-size: 0.78rem;
      }

      h1 {
        max-width: 840px;
        margin: 22px 0 18px;
        font-size: clamp(2.6rem, 8vw, 6.7rem);
        line-height: 0.92;
        letter-spacing: -0.075em;
      }

      .intro {
        max-width: 760px;
        margin: 0;
        color: var(--muted);
        font-size: clamp(1.05rem, 2vw, 1.28rem);
        line-height: 1.65;
      }

      .hero-footer {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        margin-top: 30px;
      }

      .pill {
        display: inline-flex;
        gap: 9px;
        align-items: center;
        padding: 11px 15px;
        border-radius: 999px;
        border: 1px solid var(--line);
        background: rgba(9, 10, 18, 0.36);
        color: #dce5ff;
        font-weight: 700;
      }

      .section-head {
        display: flex;
        justify-content: space-between;
        gap: 18px;
        align-items: end;
        margin: 44px 0 18px;
      }

      .section-head h2 {
        margin: 0;
        font-size: clamp(1.7rem, 3vw, 2.4rem);
        letter-spacing: -0.04em;
      }

      .section-head p {
        margin: 0;
        color: var(--muted);
      }

      .deck-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 18px;
      }

      .deck-card {
        min-height: 270px;
        border-radius: 26px;
        border: 1px solid var(--line);
        background:
          linear-gradient(160deg, rgba(255,255,255,0.13), rgba(255,255,255,0.045)),
          radial-gradient(circle at 18% 5%, rgba(255, 184, 107, 0.16), transparent 16rem);
        box-shadow: 0 18px 55px rgba(0, 0, 0, 0.25);
        transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
      }

      .deck-card:hover {
        transform: translateY(-4px);
        border-color: rgba(124, 247, 212, 0.48);
        background:
          linear-gradient(160deg, rgba(255,255,255,0.17), rgba(255,255,255,0.06)),
          radial-gradient(circle at 18% 5%, rgba(124, 247, 212, 0.18), transparent 16rem);
      }

      .deck-card a {
        display: flex;
        min-height: 270px;
        flex-direction: column;
        padding: 24px;
        text-decoration: none;
      }

      .deck-topline {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 28px;
      }

      .deck-emoji {
        display: grid;
        width: 54px;
        height: 54px;
        place-items: center;
        border-radius: 18px;
        background: rgba(255,255,255,0.1);
        font-size: 1.9rem;
      }

      .deck-language {
        color: var(--accent);
        font-size: 0.8rem;
        font-weight: 900;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .deck-card h2 {
        margin: 0 0 12px;
        font-size: 1.42rem;
        line-height: 1.16;
        letter-spacing: -0.035em;
      }

      .deck-card p {
        margin: 0;
        color: var(--muted);
        line-height: 1.55;
      }

      .deck-action {
        margin-top: auto;
        color: var(--text);
        font-weight: 900;
      }

      .empty-state {
        grid-column: 1 / -1;
        padding: 30px;
        border: 1px dashed var(--line);
        border-radius: 24px;
        background: rgba(255,255,255,0.05);
        color: var(--muted);
      }

      code {
        padding: 0.12em 0.36em;
        border-radius: 0.35em;
        background: rgba(0,0,0,0.28);
        color: #fff;
      }

      @media (max-width: 720px) {
        .shell { width: min(100% - 28px, 1180px); padding-top: 28px; }
        .hero { border-radius: 26px; }
        .section-head { display: block; }
        .section-head p { margin-top: 8px; }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <section class="hero" aria-labelledby="page-title">
        <span class="eyebrow">Deck-Galerie</span>
        <h1 id="page-title">PowerPoint Karaoke</h1>
        <p class="intro">
          Spontane Vorträge, absurde Themen, null Vorbereitung: Diese Sammlung enthält spielbare HTML-Decks für Runden, in denen Haltung wichtiger ist als Faktenlage.
        </p>
        <div class="hero-footer" aria-label="Galerie-Infos">
          <span class="pill">🎴 ${decks.length} ${deckLabel}</span>
          <span class="pill">⚡ Direkt im Browser</span>
          <span class="pill">🖥️ Desktop-first Slides</span>
        </div>
      </section>

      <section aria-labelledby="deck-list-title">
        <div class="section-head">
          <div>
            <h2 id="deck-list-title">Decks auswählen</h2>
            <p>Nur Ordner mit eigener <code>index.html</code> werden hier verlinkt.</p>
          </div>
        </div>
        <div class="deck-grid">
${cards}
        </div>
      </section>
    </main>
  </body>
</html>
`;

fs.writeFileSync(outPath, html);
console.log(`Wrote ${outPath} with ${decks.length} playable deck(s).`);
