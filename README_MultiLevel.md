# Multi-Level Presentation Creator

Ein intelligentes 3-stufiges System zur automatischen Erstellung von PowerPoint-ähnlichen Präsentationen auf Deutsch mit KI-generierten Inhalten und Bildern.

## 🎯 Überblick

Das System arbeitet in drei Ebenen:

1. **Level 1 - Content Generation**: Nutzt ein großes Sprachmodell (Claude-3.5-Sonnet) über OpenRouter zur Erstellung der Präsentationsstruktur
2. **Level 2 - HTML Generation**: Verwendet ein kleineres Modell (GPT-4o-mini) zur Generierung der Reveal.js HTML-Präsentation
3. **Level 3 - Image Generation**: Erstellt Bilder mit Replicate API (Flux-Dev Model) im 9:16 Format

## 🛠️ Installation

1. **Dependencies installieren:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Umgebungsvariablen einrichten:**
   ```bash
   # Kopiere die Beispiel-Datei
   cp .env.example .env
   
   # Bearbeite .env und füge deine API-Keys hinzu
   ```

3. **API-Keys besorgen:**
   - **OpenRouter**: Registrierung auf [openrouter.ai](https://openrouter.ai/) und API-Key erstellen
   - **Replicate**: Registrierung auf [replicate.com](https://replicate.com/) und Token erstellen

## 🚀 Verwendung

### Grundlegende Nutzung
```bash
python create_presentation.py "Dein Präsentationsthema"
```

### Mit spezifischer Präsentations-ID
```bash
python create_presentation.py "Kochen im Mittelalter" p99
```

### Beispiele
```bash
# Erstellt automatisch p17 (nächste verfügbare Nummer)
python create_presentation.py "Moderne Technologie im Büro"

# Erstellt p42 
python create_presentation.py "Geheimnisse der Quantenphysik" p42

# Mittelalterliche Themen (funktioniert besonders gut)
python create_presentation.py "Handwerk im Mittelalter"
python create_presentation.py "Musik und Tanz im 13. Jahrhundert"
```

## 📁 Output-Struktur

Nach der Ausführung wird folgende Struktur erstellt:

```
pXX/                          # Präsentationsordner
├── index.html                # Reveal.js Präsentation (Hauptdatei)
├── pXX.md                    # Markdown-Referenz der Inhalte
├── content_structure.json    # Rohe Datenstruktur
├── ComfyUI_00001_.png       # Generierte Bilder
├── ComfyUI_00002_.png
├── ...
└── ComfyUI_00010_.png

generated_images/             # Backup-Ordner für alle Bilder
├── pXX_ComfyUI_00001_.png
└── ...
```

## 🎨 Features

### Level 1: Content-Erstellung
- **Intelligente Themenentwicklung**: Das System entwickelt eigenständig eine 10-Folien-Struktur
- **Deutsche Sprache**: Alle Inhalte werden auf Deutsch erstellt
- **Mittelalterlicher Stil**: Optimiert für humorvolle, mittelalterliche Präsentationen
- **Strukturierte Ausgabe**: JSON-Format für weitere Verarbeitung

### Level 2: HTML-Erstellung  
- **Reveal.js Integration**: Moderne, responsive Präsentationen
- **FontAwesome Icons**: Automatische Icon-Auswahl passend zum Inhalt
- **9:16 Layout**: Optimiert für die generierten Bilder
- **Responsive Design**: Funktioniert auf verschiedenen Bildschirmgrößen

### Level 3: Bild-Generierung
- **Flux-Dev Model**: Hochqualitative KI-generierte Bilder
- **9:16 Aspect Ratio**: Optimiert für moderne Präsentationsformate
- **Mittelalterlicher Stil**: Automatische Stil-Optimierung
- **Backup-System**: Alle Bilder werden doppelt gespeichert

## 🔧 Konfiguration

### Model-Auswahl anpassen
```python
# In create_presentation.py
self.large_model = "anthropic/claude-3.5-sonnet"  # Für Content
self.small_model = "openai/gpt-4o-mini"          # Für HTML
```

### Verfügbare OpenRouter-Modelle
- `anthropic/claude-3.5-sonnet` (empfohlen für Content)
- `anthropic/claude-3-haiku`
- `openai/gpt-4o`
- `openai/gpt-4o-mini` (empfohlen für HTML)
- `meta-llama/llama-3.1-70b-instruct`

### Bild-Parameter anpassen
```python
# In der generate_image Methode
"guidance": 3.5,              # Prompt-Befolung (1-20)
"num_inference_steps": 28,    # Qualität vs. Geschwindigkeit
"output_quality": 80,         # Kompression (1-100)
```

## 📊 Kosten-Übersicht

**Geschätzte Kosten pro Präsentation:**
- OpenRouter (Content): ~$0.50-1.00
- OpenRouter (HTML): ~$0.10-0.20  
- Replicate (10 Bilder): ~$0.50-1.00
- **Total**: ~$1.10-2.20 pro Präsentation

## 🎯 Tipps für bessere Ergebnisse

### Themen-Formulierung
```bash
# Gut ✅
python create_presentation.py "Handwerkerberufe im Mittelalter"
python create_presentation.py "Küchengeheimnisse der Ritterzeit"

# Weniger optimal ❌
python create_presentation.py "Stuff"
python create_presentation.py "Moderne Quantencomputer"
```

### Mittelalterliche Themen funktionieren am besten:
- Handwerk und Berufe
- Alltagsleben
- Ernährung und Kochen
- Gesellschaft und Politik
- Kultur und Musik
- Humor und Satire

## 🔍 Troubleshooting

### Häufige Probleme

**API-Key Fehler:**
```bash
ValueError: OPENROUTER_API_KEY not found in environment variables
```
**Lösung:** Prüfe deine `.env` Datei und API-Keys

**JSON Parsing Fehler:**
```bash
json.decoder.JSONDecodeError: Expecting value
```
**Lösung:** Das Modell hat manchmal Probleme mit JSON. Wiederhole den Vorgang.

**Replicate Timeout:**
```bash
Failed to generate image ComfyUI_00001_.png
```
**Lösung:** Replicate Server sind überlastet. Warte einige Minuten und versuche es erneut.

### Debug-Modus
```bash
# Mehr Logging
export LOG_LEVEL=DEBUG
python create_presentation.py "Dein Thema"
```

## 🔄 Integration mit bestehenden Skripten

### Mit replace_images.py kombinieren
```bash
# Erst Präsentation erstellen
python create_presentation.py "Burgbau im Mittelalter" p20

# Dann einzelne Bilder ersetzen (falls nötig)
python replace_images.py p20
```

## 📈 Erweiterungen

Das System kann einfach erweitert werden:

1. **Neue Modelle hinzufügen** (OpenRouter)
2. **Andere Bild-Generatoren** (DALL-E, Midjourney)
3. **Verschiedene Layouts** (4:3, 16:9)
4. **Export-Formate** (PDF, PPTX)
5. **Lokale Modelle** (Ollama Integration)

## 📝 Beispiel-Workflow

```bash
# 1. Neue Präsentation erstellen
python create_presentation.py "Alchemie für Anfänger"

# 2. Präsentation öffnen
# Browser → pXX/index.html

# 3. Bilder bei Bedarf ersetzen
python replace_images.py pXX

# 4. Fertig! 🎉
```

## 📚 Weitere Ressourcen

- [Reveal.js Dokumentation](https://revealjs.com/)
- [FontAwesome Icons](https://fontawesome.com/icons)
- [OpenRouter Models](https://openrouter.ai/models)
- [Replicate Models](https://replicate.com/models) 