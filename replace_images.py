#!/usr/bin/env python3
"""
replace_images.py - Replace presentation images using prompts from image_prompts.json

Usage:
    python replace_images.py [presentation_id1 presentation_id2 ...]

If no presentation IDs are provided, processes all presentations in the JSON file.
"""

import os
import sys
import json
import requests
import shutil
import logging
from pathlib import Path
from dotenv import load_dotenv
from typing import Dict, List, Any, Optional
from tqdm import tqdm

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ImageReplacer:
    def __init__(self):
        load_dotenv()
        self.api_token = os.getenv("REPLICATE_API_TOKEN")
        if not self.api_token:
            raise ValueError("REPLICATE_API_TOKEN not found in environment variables")
        
        self.base_url = "https://api.replicate.com/v1/models/black-forest-labs/flux-dev/predictions"
        self.headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
            "Prefer": "wait"
        }
        
        # Create output directory if it doesn't exist
        self.output_dir = Path("generated_images")
        self.output_dir.mkdir(exist_ok=True)
    
    def generate_image(self, prompt: str) -> str:
        """Generate an image using the Replicate API and return the URL."""
        data = {
            "input": {
                "prompt": prompt,
                "go_fast": False,
                "guidance": 3.5,
                "megapixels": "1",
                "num_outputs": 1,
                "aspect_ratio": "9:16",
                "output_format": "webp",
                "output_quality": 80,
                "prompt_strength": 0.8,
                "num_inference_steps": 28
            }
        }
        
        logger.info(f"Generating image with prompt: {prompt}")
        response = requests.post(self.base_url, headers=self.headers, json=data)
        response.raise_for_status()
        
        result = response.json()
        if not result.get("output"):
            raise ValueError("No image was generated")
        
        return result["output"][0]
    
    def download_image(self, image_url: str, target_path: Path) -> None:
        """Download an image from URL and save it to target path."""
        response = requests.get(image_url, stream=True)
        response.raise_for_status()
        
        # Save the image
        with open(target_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        
        logger.info(f"Image saved to: {target_path}")
    
    def process_presentations(self, json_file: str, presentation_ids: Optional[List[str]] = None) -> None:
        """Process presentations specified in the JSON file."""
        try:
            # Load prompts from JSON file
            with open(json_file, 'r') as f:
                data = json.load(f)
            
            # Filter presentations if specified
            if presentation_ids:
                presentations = {p_id: data[p_id] for p_id in presentation_ids if p_id in data}
                if not presentations:
                    logger.error(f"None of the specified presentations {presentation_ids} found in {json_file}")
                    return
            else:
                presentations = data
            
            # Process each presentation
            for p_id, prompts in tqdm(presentations.items()):
                logger.info(f"Processing presentation: {p_id}")
                p_dir = Path(p_id)
                
                # Create presentation directory if it doesn't exist
                if not p_dir.exists():
                    logger.warning(f"Creating directory for presentation {p_id}")
                    p_dir.mkdir(parents=True, exist_ok=True)
                
                # Process each image prompt
                for item in prompts:
                    image_file = item["image_file"]
                    prompt = item["prompt"]
                    target_path = p_dir / image_file
                    
                    # Generate image
                    try:
                        image_url = self.generate_image(prompt)
                        
                        # Save to output directory first (as a backup)
                        safe_name = f"{p_id}_{image_file}"
                        safe_path = self.output_dir / safe_name
                        self.download_image(image_url, safe_path)
                        
                        # Copy to presentation directory
                        shutil.copy(safe_path, target_path)
                        logger.info(f"Replaced image: {target_path}")
                    except Exception as e:
                        logger.error(f"Failed to process image {image_file} for {p_id}: {str(e)}")
                
                logger.info(f"Completed processing presentation: {p_id}")
            
            logger.info(f"All presentations processed successfully")
        
        except Exception as e:
            logger.error(f"Error processing presentations: {str(e)}")
            raise

def main():
    try:
        # Get presentation IDs from command line arguments
        presentation_ids = sys.argv[1:] if len(sys.argv) > 1 else None
        
        replacer = ImageReplacer()
        json_file = "image_prompts.json"
        
        if presentation_ids:
            logger.info(f"Processing presentations: {', '.join(presentation_ids)}")
        else:
            logger.info("Processing all presentations in the JSON file")
        
        replacer.process_presentations(json_file, presentation_ids)
        
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 