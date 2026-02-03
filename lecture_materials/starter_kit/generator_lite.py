import json
import time
import random

# Simplified Generator for Students (No API Key Required for Demo)
# In the real class, we will uncomment the API parts.

def generate_mock_asset(dna):
    """
    Simulates generating an asset by creating a placeholder file.
    """
    print(f"Processing DNA #{dna['id']}: {dna['title']}...")
    print(f"  -> Synthesizing Prompt: {dna['image_prompt_one_line']}")
    
    # Simulate API latency
    time.sleep(1)
    
    print(f"  -> [Mock] Image saved to assets/dna_{dna['id']}.png")
    print("-" * 40)

def main():
    print("Initializing Batch Generator (Student Version)...")
    
    try:
        with open('dna_sample.json', 'r') as f:
            data = json.load(f)
            
        for dna in data:
            generate_mock_asset(dna)
            
        print("Batch Complete! generated 3 assets.")
        
    except FileNotFoundError:
        print("Error: dna_sample.json not found.")

if __name__ == "__main__":
    main()
