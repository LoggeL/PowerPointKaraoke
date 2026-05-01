#!/usr/bin/env python3
"""
create_presentation.py - Generate self-contained Reveal.js karaoke presentations.

The model now creates the slide narrative and the HTML directly.
No image-generation pipeline, prompt registry, or backup harness is used.

Usage:
    python create_presentation.py "Presentation Topic" [presentation_id]

Environment variables needed:
    OPENROUTER_API_KEY - Your OpenRouter API key
"""

import json
import logging
import os
import re
import sys
from pathlib import Path
from typing import Any, Dict, Optional

from dotenv import load_dotenv
from openai import OpenAI

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


class PresentationCreator:
    def __init__(self) -> None:
        load_dotenv()

        self.openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
        if not self.openrouter_api_key:
            raise ValueError("OPENROUTER_API_KEY not found in environment variables")

        try:
            import httpx

            http_client = httpx.Client(verify=False)
            self.client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=self.openrouter_api_key,
                http_client=http_client,
                default_headers={
                    "HTTP-Referer": "https://github.com/LoggeL/PowerPointKaraoke",
                    "X-Title": "PowerPoint Karaoke Creator",
                },
            )
            logger.info("OpenRouter client initialized with SSL verification disabled")
        except Exception as exc:
            logger.warning(f"Standard OpenAI client initialization failed: {exc}")
            self.client = OpenAI(
                api_key=self.openrouter_api_key,
                base_url="https://openrouter.ai/api/v1",
            )
            self.client.base_url = "https://openrouter.ai/api/v1"

        self.content_model = "x-ai/grok-4"
        self.html_model = "google/gemini-2.5-pro"

    def sanitize_presentation_id(self, presentation_id: Optional[str]) -> str:
        if presentation_id:
            return presentation_id

        existing_dirs = [d for d in Path(".").iterdir() if d.is_dir() and re.fullmatch(r"p\d+", d.name)]
        numbers = [int(d.name[1:]) for d in existing_dirs]
        next_num = max(numbers) + 1 if numbers else 1
        return f"p{next_num}"

    def sanitize_image_filename(self, image_name: str, slide_number: int) -> str:
        safe_text = re.sub(r"[^\w\s-]", "", image_name.lower())
        safe_text = re.sub(r"[-\s]+", "_", safe_text).strip("_")
        safe_text = safe_text[:30] or f"slide_{slide_number}"
        return f"{slide_number:02d}_{safe_text}.svg"

    def generate_content_structure(self, topic: str) -> Dict[str, Any]:
        logger.info(f"Generating content structure for topic: {topic}")

        system_prompt = """Du erstellst absurde, starke PowerPoint-Karaoke-Präsentationen auf Deutsch.
Erzeuge eine komplett eigenständige 10-Folien-Struktur nur aus dem Thema selbst.
Ignoriere existierende Projektinhalte und orientiere dich nicht an früheren Präsentationen.

Wichtig:
- Alle Inhalte auf Deutsch
- Humorvoll, überraschend, kreativ, bühnenwirksam
- Kein Rückgriff auf bestehende Folien, Bilddateien oder alte Formate
- Jede Folie soll für gesprochenes Impro-Theater taugen
- Keine Charts
- Liefere zusätzlich pro Folie eine kurze visuelle Szene, die wir lokal als stilisierte Platzhaltergrafik rendern können
- Gib nur valides JSON zurück
"""

        user_prompt = f"""Erstelle eine 10-Folien-Präsentation für das Thema: \"{topic}\".

Antworte ausschließlich als JSON in diesem Format:
{{
  "title": "Gesamttitel",
  "tagline": "Kurzer Untertitel oder Hook",
  "slides": [
    {{
      "slide_number": 1,
      "title": "Folientitel",
      "subtitle": "Kurzer Untertitel",
      "content": "2-4 Sätze mit starkem, präsentierbarem Inhalt",
      "icons": ["fa-solid fa-star", "fa-solid fa-skull"],
      "visual": {{
        "label": "Kurzer Szenenname",
        "accent": "#RRGGBB",
        "motif": "3-8 Wörter, welche Bildidee/Stimmung gezeigt werden soll"
      }}
    }}
  ]
}}

Regeln:
- Genau 10 Folien
- Icons aus Font Awesome 6 free solid, 1-3 pro Folie
- visual.label kurz und knackig
- visual.motif auf Deutsch
- Der Gesamtstil soll originell sein und nicht wie ein Abklatsch vorhandener Inhalte wirken
"""

        response = self.client.chat.completions.create(
            model=self.content_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.9,
            max_tokens=5000,
        )

        content = response.choices[0].message.content
        if "```json" in content:
            content = content.split("```json", 1)[1].split("```", 1)[0].strip()
        elif "```" in content:
            content = content.split("```", 1)[1].rsplit("```", 1)[0].strip()

        structure = json.loads(content)

        for slide in structure["slides"]:
            visual = slide.get("visual", {})
            image_name = visual.get("label") or slide["title"]
            slide["image_file"] = self.sanitize_image_filename(image_name, slide["slide_number"])

        return structure

    def build_svg_placeholder(self, slide: Dict[str, Any]) -> str:
        visual = slide.get("visual", {})
        accent = visual.get("accent") or "#7c3aed"
        label = (visual.get("label") or slide["title"]).replace("&", "&amp;")
        motif = (visual.get("motif") or "Bühnenchaos").replace("&", "&amp;")
        title = slide["title"].replace("&", "&amp;")

        return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#111827" />
      <stop offset="100%" stop-color="{accent}" />
    </linearGradient>
  </defs>
  <rect width="1080" height="1920" fill="url(#bg)" />
  <circle cx="860" cy="320" r="180" fill="rgba(255,255,255,0.08)" />
  <circle cx="220" cy="1460" r="220" fill="rgba(255,255,255,0.05)" />
  <rect x="90" y="120" width="900" height="1680" rx="48" fill="rgba(0,0,0,0.25)" stroke="rgba(255,255,255,0.18)" />
  <text x="140" y="240" fill="#f8fafc" font-family="Arial, Helvetica, sans-serif" font-size="54" font-weight="700">{label}</text>
  <text x="140" y="320" fill="#e2e8f0" font-family="Arial, Helvetica, sans-serif" font-size="40">{motif}</text>
  <text x="140" y="1640" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="68" font-weight="700">{title}</text>
  <text x="140" y="1725" fill="#cbd5e1" font-family="Arial, Helvetica, sans-serif" font-size="34">KI-generierte Bühnenfolie · PowerPoint Karaoke</text>
</svg>'''

    def generate_html_presentation(self, content_structure: Dict[str, Any], presentation_id: str) -> str:
        logger.info(f"Generating HTML presentation for {presentation_id}")
        content_json = json.dumps(content_structure, indent=2, ensure_ascii=False)

        system_prompt = """Du erzeugst vollständige Reveal.js-Präsentationen als HTML.
Die Präsentation soll sich eigenständig anfühlen und nicht aus vorhandenen Templates kopiert wirken.

Anforderungen:
- Vollständige HTML-Datei
- Reveal.js 4.3.1
- Font Awesome 6.2.0
- Schwarzes Theme
- Layout mit linker Visual-Spalte (40%) und rechter Textspalte (60%)
- Verwende die image_file-Felder als lokale Bildquellen
- Verwende nur den gelieferten JSON-Inhalt, keine Referenzen auf alte Präsentationen
- Sauberes, modernes Styling inline
- Keine Charts
- Ausgabe nur als HTML
"""

        user_prompt = f"""Erstelle aus dieser Struktur eine komplette Reveal.js HTML-Datei:

{content_json}

Zusatzregeln:
- Titelfolie darf direkt Folie 1 sein, kein extra Intro nötig
- Jede Folie soll die Icons prominent, aber nicht albern-chaotisch einsetzen
- Text gut lesbar, präsentationsfähig, klare Hierarchie
- Mobile responsive
- Gib ausschließlich HTML zurück
"""

        response = self.client.chat.completions.create(
            model=self.html_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.4,
            max_tokens=9000,
        )

        html_content = response.choices[0].message.content
        if "```html" in html_content:
            html_content = html_content.split("```html", 1)[1].split("```", 1)[0].strip()
        elif "```" in html_content:
            html_content = html_content.split("```", 1)[1].rsplit("```", 1)[0].strip()

        return html_content

    def create_markdown_file(self, content_structure: Dict[str, Any], presentation_id: str) -> None:
        markdown_content = [f"# {content_structure['title']}", ""]
        tagline = content_structure.get("tagline")
        if tagline:
            markdown_content += [f"> {tagline}", ""]

        for slide in content_structure["slides"]:
            markdown_content += [f"## Folie {slide['slide_number']}: {slide['title']}", ""]
            if slide.get("subtitle"):
                markdown_content += [f"**Untertitel:** {slide['subtitle']}", ""]
            markdown_content += [f"**Inhalt:**\n{slide['content']}", ""]
            if slide.get("icons"):
                markdown_content += [f"**Icons:** {', '.join(slide['icons'])}", ""]
            if slide.get("visual"):
                markdown_content += [f"**Visual:** {json.dumps(slide['visual'], ensure_ascii=False)}", ""]
            markdown_content += [f"**Bilddatei:** {slide['image_file']}", "", "---", ""]

        p_dir = Path(presentation_id)
        p_dir.mkdir(exist_ok=True)
        (p_dir / f"{presentation_id}.md").write_text("\n".join(markdown_content), encoding="utf-8")

    def create_presentation(self, topic: str, presentation_id: Optional[str] = None) -> str:
        presentation_id = self.sanitize_presentation_id(presentation_id)
        logger.info(f"Creating presentation: {presentation_id}")

        p_dir = Path(presentation_id)
        p_dir.mkdir(exist_ok=True)

        content_structure = self.generate_content_structure(topic)
        (p_dir / "content_structure.json").write_text(
            json.dumps(content_structure, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )

        self.create_markdown_file(content_structure, presentation_id)

        for slide in content_structure["slides"]:
            svg = self.build_svg_placeholder(slide)
            (p_dir / slide["image_file"]).write_text(svg, encoding="utf-8")

        html_content = self.generate_html_presentation(content_structure, presentation_id)
        (p_dir / "index.html").write_text(html_content, encoding="utf-8")

        logger.info(f"Successfully created presentation: {presentation_id}")
        return presentation_id


def main() -> None:
    if len(sys.argv) < 2:
        print('Usage: python create_presentation.py "Presentation Topic" [presentation_id]')
        sys.exit(1)

    topic = sys.argv[1]
    presentation_id = sys.argv[2] if len(sys.argv) > 2 else None

    try:
        creator = PresentationCreator()
        result_id = creator.create_presentation(topic, presentation_id)
        print(f"\n✅ Presentation successfully created: {result_id}")
        print(f"📁 Files are in the '{result_id}' directory")
        print(f"🌐 Open {result_id}/index.html to view the presentation")
    except Exception as exc:
        print(f"\n❌ Error: {exc}")
        sys.exit(1)


if __name__ == "__main__":
    main()
