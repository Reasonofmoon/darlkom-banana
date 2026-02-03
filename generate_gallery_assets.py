import json
import os
import time
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
JSON_PATH = "templates.json"
OUTPUT_DIR = "assets/thumbnails"

# -----------------------------------------------------------------------------
# MODEL CONFIGURATION
# -----------------------------------------------------------------------------
MODEL_NAME = "imagen-4.0-fast-generate-001" 
# -----------------------------------------------------------------------------

# Initialize Client
client = None
if GOOGLE_API_KEY:
    client = genai.Client(api_key=GOOGLE_API_KEY)
else:
    print("WARNING: No GOOGLE_API_KEY found in environment. Script will run in DRY RUN mode.")

def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

def get_or_synthesize_prompt(dna):
    if dna.get("image_prompt_one_line") and len(dna.get("image_prompt_one_line").strip()) > 0:
        return dna.get("image_prompt_one_line")
    if dna.get("prompt") and len(dna.get("prompt").strip()) > 0:
        return dna.get("prompt")
    
    # Fallback Synthesis - richer and more style-aware
    role = dna.get("role_bucket", "background")
    title = dna.get("title", "Abstract Design")
    elaboration = dna.get("elaboration", "")
    
    # Extract palette colors if available
    palette = dna.get("palette", {})
    accents = ", ".join(palette.get("accents", [])) if palette.get("accents") else "harmonious colors"
    
    # Synthesize a more descriptive prompt using the Korean elaboration which Imagen understands well
    synthesized = f"A premium presentation slide background in the style of '{title}'. \n" \
                  f"Design intent: {elaboration}. \n" \
                  f"Key colors: {accents}. \n" \
                  f"Role: {role}. \n" \
                  f"High resolution, 8k, wallpaper quality, no text blocks, abstract and evocative representation of the theme."
    return synthesized

def generate_image_google(prompt, output_path):
    if not client:
        print(f"[DRY RUN] Would generate for: {output_path}")
        return False

    try:
        print(f"Generating: {output_path}...")
        
        # New SDK Call
        response = client.models.generate_images(
            model=MODEL_NAME,
            prompt=prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
                aspect_ratio="16:9",
            )
        )

        if response.generated_images:
            image_bytes = response.generated_images[0].image.image_bytes
            with open(output_path, "wb") as f:
                f.write(image_bytes)
            print(f"Success: Saved to {output_path}")
            return True
        else:
            print(f"Failed: No image descriptor returned for {output_path}")
            return False

    except Exception as e:
        print(f"Error generating {output_path}: {e}")
        return False

def main():
    ensure_dir(OUTPUT_DIR)
    
    try:
        with open(JSON_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        dna_list = []
        if isinstance(data, list):
            dna_list = data
        elif "styles_001_100" in data:
            dna_list = data["styles_001_100"]

        print(f"Found {len(dna_list)} DNA entries.")
        print(f"Using Model: {MODEL_NAME}")

        count = 0
        for dna in dna_list:
            dna_id = dna.get("id")
            if dna_id is None:
                continue

            filename = f"dna_{dna_id}.png"
            output_path = os.path.join(OUTPUT_DIR, filename)

            if os.path.exists(output_path):
                print(f"Skipping {filename} (Already exists)")
                continue

            prompt = get_or_synthesize_prompt(dna)
            
            success = generate_image_google(prompt, output_path)
            
            if success:
                count += 1
                time.sleep(4) 

        print(f"Batch generation complete. Generated {count} new images.")

    except Exception as e:
        print(f"Critical Error: {e}")

if __name__ == "__main__":
    main()
