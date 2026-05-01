import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const repoRoot = process.cwd();
const decksDir = path.join(repoRoot, 'decks');
const screenshotDir = path.join(repoRoot, 'screenshots', 'validation');

const viewports = [
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'desktop-1920x1080', width: 1920, height: 1080 }
];

function findDecks() {
  if (!fs.existsSync(decksDir)) return [];
  return fs.readdirSync(decksDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      slug: entry.name,
      filePath: path.join(decksDir, entry.name, 'index.html')
    }))
    .filter((deck) => fs.existsSync(deck.filePath));
}

const decks = findDecks();
fs.mkdirSync(screenshotDir, { recursive: true });

const failures = [];

const browser = await chromium.launch({ headless: true });
for (const deck of decks) {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
    const url = `file://${deck.filePath}`;
    await page.goto(url);
    await page.waitForTimeout(300);

    const result = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      const overflowX = Math.max(body.scrollWidth, html.scrollWidth) - window.innerWidth;
      const overflowY = Math.max(body.scrollHeight, html.scrollHeight) - window.innerHeight;

      const badNodes = [];
      const elements = Array.from(document.querySelectorAll('body *'));
      for (const el of elements) {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') continue;
        const rect = el.getBoundingClientRect();
        if (!rect.width && !rect.height) continue;
        const outside = rect.right > window.innerWidth + 1 || rect.bottom > window.innerHeight + 1 || rect.left < -1 || rect.top < -1;
        if (outside) {
          badNodes.push({
            tag: el.tagName.toLowerCase(),
            text: (el.textContent || '').trim().slice(0, 80),
            rect: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom }
          });
          if (badNodes.length >= 8) break;
        }
      }

      return {
        title: document.title,
        overflowX,
        overflowY,
        badNodes
      };
    });

    const shotPath = path.join(screenshotDir, `${deck.slug}-${viewport.name}.png`);
    await page.screenshot({ path: shotPath, fullPage: false });
    await page.close();

    if (result.overflowX > 0 || result.overflowY > 0 || result.badNodes.length > 0) {
      failures.push({ deck: deck.slug, viewport: viewport.name, ...result, screenshot: shotPath });
    }
  }
}
await browser.close();

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, decks: decks.map((deck) => deck.slug), screenshots: screenshotDir }, null, 2));
