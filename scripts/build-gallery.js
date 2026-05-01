import fs from 'fs';
import path from 'path';

const repoRoot = process.cwd();
const decksDir = path.join(repoRoot, 'decks');
const outPath = path.join(repoRoot, 'index.html');

function readMeta(deckPath, slug) {
  const metaPath = path.join(deckPath, 'meta.json');
  if (fs.existsSync(metaPath)) {
    return JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  }
  return {
    title: slug,
    description: 'Ohne Beschreibung.',
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
        const meta = readMeta(deckPath, slug);
        return {
          slug,
          ...meta
        };
      })
      .sort((a, b) => a.title.localeCompare(b.title, 'de'))
  : [];

const cards = decks
  .map(
    (deck) => `
        <article class="presentation-card">
          <div class="card-header">
            <h2><span class="emoji">${deck.emoji ?? '🎤'}</span> ${deck.title}</h2>
          </div>
          <div class="card-body">
            <p>${deck.description ?? ''}</p>
            <p class="meta">Sprache: ${deck.language ?? 'de'}</p>
          </div>
          <div class="card-footer">
            <a href="decks/${deck.slug}/index.html" class="btn">Ansehen</a>
          </div>
        </article>`
  )
  .join('\n');

const html = `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PowerPoint Karaoke</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #0d1016;
        --panel: #171c25;
        --panel-2: #222938;
        --text: #eef2ff;
        --muted: #a6b0c3;
        --accent: #79ffe1;
        --accent-2: #82aaff;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Inter, ui-sans-serif, system-ui, sans-serif;
        background: radial-gradient(circle at top, #1b2230, var(--bg) 55%);
        color: var(--text);
        padding: 32px;
      }
      .container {
        max-width: 1200px;
        margin: 0 auto;
      }
      h1 {
        font-size: clamp(2.4rem, 5vw, 4.5rem);
        margin: 0 0 16px;
      }
      .intro {
        max-width: 800px;
        color: var(--muted);
        font-size: 1.05rem;
        line-height: 1.6;
        margin-bottom: 32px;
      }
      .presentations {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 24px;
      }
      .presentation-card {
        background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 18px 60px rgba(0,0,0,0.28);
      }
      .card-header {
        padding: 20px 22px 12px;
        background: linear-gradient(135deg, rgba(130,170,255,0.18), rgba(121,255,225,0.06));
      }
      .card-header h2 {
        margin: 0;
        font-size: 1.4rem;
        line-height: 1.25;
      }
      .emoji { margin-right: 8px; }
      .card-body {
        padding: 18px 22px;
        color: var(--muted);
        line-height: 1.6;
        min-height: 132px;
      }
      .meta {
        margin-top: 12px;
        color: var(--accent);
        font-size: 0.92rem;
      }
      .card-footer {
        padding: 0 22px 22px;
      }
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 12px 18px;
        border-radius: 999px;
        text-decoration: none;
        background: linear-gradient(135deg, var(--accent), var(--accent-2));
        color: #071018;
        font-weight: 800;
      }
    </style>
  </head>
  <body>
    <main class="container">
      <h1>PowerPoint Karaoke</h1>
      <p class="intro">
        Rohe HTML-Decks mit maximaler Agenten-Kreativität, minimaler Bürokratie und einer klaren Regel: auf Desktop muss der Kram sauber sitzen.
      </p>
      <section class="presentations">
${cards}
      </section>
    </main>
  </body>
</html>
`;

fs.writeFileSync(outPath, html);
console.log(`Wrote ${outPath} with ${decks.length} deck(s).`);
