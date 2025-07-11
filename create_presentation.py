#!/usr/bin/env python3
"""
create_presentation.py - Multi-level presentation creation script

Level 1: Generate content structure using large model (OpenRouter)
Level 2: Generate HTML presentation using smaller model (OpenRouter)  
Level 3: Generate images using Replicate API

Usage:
    python create_presentation.py "Presentation Topic" [presentation_id]

Environment variables needed:
    OPENROUTER_API_KEY - Your OpenRouter API key
    REPLICATE_API_TOKEN - Your Replicate API token
"""

import os
import sys
import json
import requests
import shutil
import logging
import re
from pathlib import Path
from dotenv import load_dotenv
from typing import Dict, List, Any, Optional
from tqdm import tqdm
import time
from openai import OpenAI

# Disable SSL warnings when ignoring certificates
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class PresentationCreator:
    def __init__(self):
        load_dotenv()
        
        # OpenRouter configuration
        self.openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
        if not self.openrouter_api_key:
            raise ValueError("OPENROUTER_API_KEY not found in environment variables")
        
        # Replicate configuration
        self.replicate_api_token = os.getenv("REPLICATE_API_TOKEN")
        if not self.replicate_api_token:
            raise ValueError("REPLICATE_API_TOKEN not found in environment variables")
        
        # Initialize OpenRouter client with explicit parameters
        try:
            import httpx
            # Create httpx client that ignores SSL verification
            http_client = httpx.Client(verify=False)
            
            self.client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=self.openrouter_api_key,
                http_client=http_client,
                default_headers={
                    "HTTP-Referer": "https://github.com/LoggeL/PowerPointKaraoke",  # Optional
                    "X-Title": "PowerPoint Karaoke Creator",  # Optional  
                }
            )
            logger.info("OpenRouter client initialized with SSL verification disabled")
        except Exception as e:
            # Fallback initialization for older OpenAI library versions
            logger.warning(f"Standard OpenAI client initialization failed: {e}")
            logger.info("Trying fallback initialization...")
            self.client = OpenAI(
                api_key=self.openrouter_api_key,
                base_url="https://openrouter.ai/api/v1",
            )
            # Manually set base URL for older versions
            self.client.base_url = "https://openrouter.ai/api/v1"
        
        # Replicate API setup
        self.replicate_base_url = "https://api.replicate.com/v1/models/recraft-ai/recraft-v3/predictions"
        self.replicate_headers = {
            "Authorization": f"Bearer {self.replicate_api_token}",
            "Content-Type": "application/json",
            "Prefer": "wait"
        }
        
        # Model configurations - Updated with correct OpenRouter model names
        # self.large_model = "anthropic/claude-opus-4"       # For content generation
        # self.small_model = "x-ai/grok-3"   # For HTML generation
        self.large_model = "x-ai/grok-4"       # For content generation
        self.small_model = "google/gemini-2.5-pro"   # For HTML generation
        # self.large_model = "nousresearch/hermes-3-llama-3.1-405b"       # For content generation

        # Create output directory
        self.output_dir = Path("generated_images")
        self.output_dir.mkdir(exist_ok=True)
    
    def sanitize_filename(self, text: str, slide_number: int) -> str:
        """Create a safe filename from text content."""
        # Remove special characters and replace with underscores
        safe_text = re.sub(r'[^\w\s-]', '', text.lower())
        # Replace spaces and multiple underscores with single underscore
        safe_text = re.sub(r'[-\s]+', '_', safe_text)
        # Limit length and add slide number prefix
        safe_text = safe_text[:30].strip('_')
        if not safe_text:
            safe_text = f"slide_{slide_number}"
        return f"{slide_number:02d}_{safe_text}.png"
    
    def generate_content_structure(self, topic: str) -> Dict[str, Any]:
        """Level 1: Generate presentation content using large model."""
        logger.info(f"Level 1: Generating content structure for topic: {topic}")
        
        system_prompt = """Du bist ein Experte für die Erstellung von PowerPoint-Präsentationen auf Deutsch. 
        Erstelle eine detaillierte Präsentationsstruktur mit 10 Folien basierend auf dem gegebenen Thema.
        
        Die Struktur sollte enthalten:
        - Folientitel
        - Haupttext/Inhalt  
        - Bildbeschreibungen für 9:16 Bilder auf ENGLISH
        - Kurze Bilddateinamen (3-4 Wörter, beschreibend)
        - FontAwesome Icon-Vorschläge
        - Spezielle Elemente wie Charts wenn passend
        
        Wichtig: 
        - Alle Inhalte auf Deutsch (außer Bildbeschreibungen)
        - Kreativer, humorvoller Stil
        - Realistische und interessante Inhalte
        - Erlaube derben und vulgären Stil
        - Der Humor kann ruhig überspitzt sein (vergleiche Cards Against Humanity)
        """
        
        user_prompt = f"""Erstelle eine Präsentationsstruktur für das Thema: "{topic}"

        Bitte gib die Antwort als JSON zurück mit folgender Struktur:
        {{
            "title": "Haupttitel der Präsentation",
            "slides": [
                {{
                    "slide_number": 1,
                    "title": "Folientitel",
                    "subtitle": "Untertitel (optional)",
                    "content": "Haupttext/Inhalt der Folie",
                    "icons": ["fa-solid fa-crown", "fa-solid fa-skull"],
                    "image_description": "Detaillierte Beschreibung des Bildes für die KI-Generierung auf ENGLISH",
                    "image_name": "kurzer_beschreibender_name",
                    "special_elements": "Charts, Diagramme etc. (optional)"
                }}
            ]
        }}
        
        Erstelle genau 10 Folien mit vielfältigen, interessanten Inhalten.
        Für image_name verwende kurze, beschreibende Namen auf Deutsch (3-4 Wörter, keine Sonderzeichen)."""
        
        try:
            logger.info(f"Sending request to OpenRouter using model: {self.large_model}")
            response = self.client.chat.completions.create(
                model=self.large_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=4000
            )
            
            content = response.choices[0].message.content
            logger.info("Successfully received response from OpenRouter")
            
            # Try to extract JSON from the response
            if "```json" in content:
                json_start = content.find("```json") + 7
                json_end = content.find("```", json_start)
                content = content[json_start:json_end].strip()
            elif "```" in content:
                json_start = content.find("```") + 3
                json_end = content.rfind("```")
                content = content[json_start:json_end].strip()
            
            structure = json.loads(content)
            
            # Generate safe filenames for each slide
            for slide in structure['slides']:
                slide_num = slide['slide_number']
                # Use provided image_name or fall back to title
                base_name = slide.get('image_name', slide['title'])
                slide['image_file'] = self.sanitize_filename(base_name, slide_num)
                logger.info(f"Generated filename for slide {slide_num}: {slide['image_file']}")
            
            logger.info("Successfully generated content structure with image names")
            return structure
            
        except requests.exceptions.ConnectionError as e:
            logger.error(f"Network connection error to OpenRouter: {str(e)}")
            logger.error("Please check your internet connection and try again")
            raise
        except requests.exceptions.Timeout as e:
            logger.error(f"Request timeout to OpenRouter: {str(e)}")
            logger.error("OpenRouter is taking too long to respond, try again later")
            raise
        except requests.exceptions.HTTPError as e:
            logger.error(f"HTTP error from OpenRouter: {str(e)}")
            logger.error("This might be an API key issue or model availability problem")
            raise
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {str(e)}")
            logger.error(f"Raw response content: {content[:500]}...")
            raise
        except KeyError as e:
            logger.error(f"Missing expected field in API response: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error in content generation: {str(e)}")
            logger.error(f"Error type: {type(e).__name__}")
            raise
    
    def generate_html_presentation(self, content_structure: Dict[str, Any], presentation_id: str) -> str:
        """Level 2: Generate HTML presentation using smaller model."""
        logger.info(f"Level 2: Generating HTML presentation for {presentation_id}")
        
        system_prompt = """Du bist ein Experte für die Erstellung von Reveal.js Präsentationen. 
        Erstelle eine vollständige HTML-Datei basierend auf der gegebenen Inhaltsstruktur.
        
        Wichtige Anforderungen:
        - Verwende Reveal.js 4.3.1
        - Verwende FontAwesome 6.2.0 für Icons
        - Bilder sind im 9:16 Format (verwende die Dateinamen aus image_file)
        - Layout: 40% Bild links, 60% Inhalt rechts
        - Responsive Design
        - Deutsche Sprache
        - Schwarzes Theme
        - Alle Styles inline
        
        Das Layout soll dem Beispiel folgen:
        - slide-container als Flex-Container
        - slide-image für Bilder (40% Breite)
        - slide-content für Text (60% Breite)
        """
        
        content_json = json.dumps(content_structure, indent=2, ensure_ascii=False)
        
        user_prompt = f"""Erstelle eine vollständige HTML-Datei für eine Reveal.js Präsentation basierend auf dieser Inhaltsstruktur:

        {content_json}
        
        Wichtig:
        - Verwende für jede Folie den spezifischen Dateinamen aus dem "image_file" Feld
        - Verwende die Icons aus der Struktur als <i class="..."></i> Tags
        - Implementiere spezielle Elemente wie Charts wenn angegeben
        - Alle Texte sollen gut formatiert und lesbar sein
        - Responsive Layout für verschiedene Bildschirmgrößen
        - Erlaube derben und vulgären Stil
        
        Gib nur den reinen HTML-Code zurück, ohne zusätzliche Erklärungen."""
        
        try:
            response = self.client.chat.completions.create(
                model=self.small_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=8000
            )
            
            html_content = response.choices[0].message.content
            
            # Clean up the response (remove markdown code blocks if present)
            if "```html" in html_content:
                html_start = html_content.find("```html") + 7
                html_end = html_content.find("```", html_start)
                html_content = html_content[html_start:html_end].strip()
            elif "```" in html_content:
                html_start = html_content.find("```") + 3
                html_end = html_content.rfind("```")
                html_content = html_content[html_start:html_end].strip()
            
            logger.info("Successfully generated HTML presentation")
            return html_content
            
        except Exception as e:
            logger.error(f"Error generating HTML presentation: {str(e)}")
            raise
    
    def generate_image(self, prompt: str) -> str:
        """Level 3: Generate an image using Replicate API with recraft-v3 model."""
        data = {
            "input": {
                "prompt": prompt,
                "style": "realistic_image",
                "size": "1024x1820",  # Closest to 9:16 aspect ratio (1:1.78) for recraft-v3
                "output_format": "webp"
            }
        }
        
        logger.info(f"Level 3: Generating image with recraft-v3...")
        logger.info(f"Prompt: {prompt[:100]}...")
        
        try:
            response = requests.post(
                self.replicate_base_url, 
                headers=self.replicate_headers, 
                json=data, 
                timeout=120,
                verify=False  # Ignore SSL certificate errors
            )
            response.raise_for_status()
            
            result = response.json()
            logger.info(f"Replicate API response status: {response.status_code}")
            
            if not result.get("output"):
                logger.error(f"No image output received. Full response: {result}")
                raise ValueError("No image was generated")
            
            image_url = result["output"][0] if isinstance(result["output"], list) else result["output"]
            logger.info(f"Image generated successfully: {image_url[:50]}...")
            return image_url
            
        except requests.exceptions.Timeout:
            logger.error("Replicate API timeout after 120 seconds")
            raise
        except requests.exceptions.ConnectionError as e:
            logger.error(f"Connection error to Replicate API: {str(e)}")
            raise
        except requests.exceptions.HTTPError as e:
            logger.error(f"HTTP error from Replicate API: {response.status_code} - {response.text}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error in image generation: {str(e)}")
            raise
    
    def download_image(self, image_url: str, target_path: Path) -> None:
        """Download an image from URL and save it to target path."""
        response = requests.get(image_url, stream=True, verify=False)  # Ignore SSL certificate errors
        response.raise_for_status()
        
        with open(target_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        
        logger.info(f"Image saved to: {target_path}")
    
    def create_markdown_file(self, content_structure: Dict[str, Any], presentation_id: str) -> None:
        """Create a markdown file with the content structure for reference."""
        markdown_content = f"# {content_structure['title']}\n\n"
        
        for slide in content_structure['slides']:
            markdown_content += f"## Folie {slide['slide_number']}: {slide['title']}\n\n"
            if slide.get('subtitle'):
                markdown_content += f"**Untertitel:** {slide['subtitle']}\n\n"
            markdown_content += f"**Inhalt:**\n{slide['content']}\n\n"
            if slide.get('icons'):
                markdown_content += f"**Icons:** {', '.join(slide['icons'])}\n\n"
            markdown_content += f"**Bilddatei:** {slide.get('image_file', 'N/A')}\n\n"
            markdown_content += f"**Bildbeschreibung:** {slide['image_description']}\n\n"
            if slide.get('special_elements'):
                markdown_content += f"**Spezielle Elemente:** {slide['special_elements']}\n\n"
            markdown_content += "---\n\n"
        
        # Save markdown file
        p_dir = Path(presentation_id)
        p_dir.mkdir(exist_ok=True)
        markdown_path = p_dir / f"{presentation_id}.md"
        
        with open(markdown_path, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        
        logger.info(f"Markdown file saved to: {markdown_path}")
    
    def create_presentation(self, topic: str, presentation_id: Optional[str] = None) -> str:
        """Main method to create a complete presentation."""
        try:
            # Generate presentation ID if not provided
            if not presentation_id:
                # Find next available presentation ID
                existing_dirs = [d for d in Path('.').iterdir() if d.is_dir() and d.name.startswith('p')]
                existing_nums = []
                for d in existing_dirs:
                    try:
                        num = int(d.name[1:])
                        existing_nums.append(num)
                    except ValueError:
                        continue
                
                next_num = max(existing_nums) + 1 if existing_nums else 1
                presentation_id = f"p{next_num}"
            
            logger.info(f"Creating presentation: {presentation_id}")
            logger.info(f"Topic: {topic}")
            
            # Create presentation directory
            p_dir = Path(presentation_id)
            p_dir.mkdir(exist_ok=True)
            
            # Level 1: Generate content structure
            content_structure = self.generate_content_structure(topic)
            
            # Save content structure for reference
            with open(p_dir / "content_structure.json", 'w', encoding='utf-8') as f:
                json.dump(content_structure, f, indent=2, ensure_ascii=False)
            
            # Create markdown file for reference
            self.create_markdown_file(content_structure, presentation_id)
            
            # Level 2: Generate HTML presentation
            html_content = self.generate_html_presentation(content_structure, presentation_id)
            
            # Save HTML file
            html_path = p_dir / "index.html"
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            logger.info(f"HTML presentation saved to: {html_path}")
            
            # Level 3: Generate images for all slides
            image_prompts = []
            for i, slide in enumerate(content_structure['slides'], 1):
                image_file = slide.get('image_file', f"{i:02d}_slide_{i}.png")
                image_description = slide['image_description']
                
                image_prompts.append({
                    "image_file": image_file,
                    "prompt": image_description
                })
                
                try:
                    # Generate and download image
                    image_url = self.generate_image(image_description)
                    
                    # Save to output directory (backup)
                    safe_name = f"{presentation_id}_{image_file}"
                    safe_path = self.output_dir / safe_name
                    self.download_image(image_url, safe_path)
                    
                    # Copy to presentation directory
                    target_path = p_dir / image_file
                    shutil.copy(safe_path, target_path)
                    logger.info(f"Image {i}/10 completed: {image_file}")
                    
                    # Small delay to avoid rate limiting
                    time.sleep(1)
                    
                except Exception as e:
                    logger.error(f"Failed to generate image {image_file}: {str(e)}")
            
            # Update image_prompts.json with new presentation
            try:
                with open("image_prompts.json", 'r', encoding='utf-8') as f:
                    all_prompts = json.load(f)
            except FileNotFoundError:
                all_prompts = {}
            
            all_prompts[presentation_id] = image_prompts
            
            with open("image_prompts.json", 'w', encoding='utf-8') as f:
                json.dump(all_prompts, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Successfully created presentation: {presentation_id}")
            logger.info(f"Files created in directory: {p_dir}")
            logger.info(f"- index.html (Reveal.js presentation)")
            logger.info(f"- {presentation_id}.md (content reference)")
            logger.info(f"- content_structure.json (raw structure)")
            
            # List generated image files
            logger.info("Generated image files:")
            for slide in content_structure['slides']:
                logger.info(f"  - {slide.get('image_file', 'N/A')}")
            
            return presentation_id
            
        except Exception as e:
            logger.error(f"Error creating presentation: {str(e)}")
            raise

def main():
    if len(sys.argv) < 2:
        print("Usage: python create_presentation.py \"Presentation Topic\" [presentation_id]")
        print("Example: python create_presentation.py \"Kochen im Mittelalter\"")
        print("Example: python create_presentation.py \"Moderne Technologie\" p42")
        sys.exit(1)
    
    topic = sys.argv[1]
    presentation_id = sys.argv[2] if len(sys.argv) > 2 else None
    
    try:
        creator = PresentationCreator()
        result_id = creator.create_presentation(topic, presentation_id)
        print(f"\n✅ Presentation successfully created: {result_id}")
        print(f"📁 Files are in the '{result_id}' directory")
        print(f"🌐 Open {result_id}/index.html to view the presentation")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 