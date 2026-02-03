import json
import random

# Categories and Seeds
categories = {
    "Corporate": [
        {"name": "Swiss International", "colors": ["#FF0000", "#FFFFFF", "#000000"], "mood": "objective"},
        {"name": "McKinsey Clean", "colors": ["#002D62", "#F0F0F0", "#5E8DA6"], "mood": "professional"},
        {"name": "Tech Minimal", "colors": ["#000000", "#FFFFFF", "#00FF41"], "mood": "innovative"},
        {"name": "Big Four Audit", "colors": ["#FFFF00", "#000000", "#333333"], "mood": "bold"},
        {"name": "Legal Trust", "colors": ["#1C2833", "#FDFEFE", "#C0392B"], "mood": "authoritative"},
        {"name": "Startup Pitch", "colors": ["#6C3483", "#FFFFFF", "#F39C12"], "mood": "energetic"},
        {"name": "Financial Data", "colors": ["#117864", "#F2F3F4", "#85C1E9"], "mood": "trustworthy"},
        {"name": "Global Trade", "colors": ["#1F618D", "#F8F9F9", "#E74C3C"], "mood": "connected"},
        {"name": "Eco Corporate", "colors": ["#2ECC71", "#FFFFFF", "#27AE60"], "mood": "sustainable"},
        {"name": "Luxury Real Estate", "colors": ["#17202A", "#FDFEFE", "#D4AC0D"], "mood": "premium"},
        {"name": "Pharma Clean", "colors": ["#2980B9", "#FFFFFF", "#A9DFBF"], "mood": "clinical"},
        {"name": "Energy Sector", "colors": ["#E67E22", "#FDFEFE", "#2E86C1"], "mood": "powerful"},
        {"name": "Consulting Grid", "colors": ["#34495E", "#ECF0F1", "#3498DB"], "mood": "analytical"},
        {"name": "Executive Brief", "colors": ["#212F3D", "#FBFCFC", "#95A5A6"], "mood": "concise"},
        {"name": "Investor Relations", "colors": ["#154360", "#F4F6F7", "#D68910"], "mood": "stable"}
    ],
    "Creative": [
        {"name": "Acid Graphics", "colors": ["#CCFF00", "#111111", "#FF00FF"], "mood": "trippy"},
        {"name": "Risograph Print", "colors": ["#2E4057", "#FFE4E1", "#FF6B6B"], "mood": "textured"},
        {"name": "Collagen Art", "colors": ["#FAD7A0", "#6E2C00", "#D35400"], "mood": "mixed-media"},
        {"name": "Brutalism Mono", "colors": ["#000000", "#CCCCCC", "#0000FF"], "mood": "raw"},
        {"name": "Vaporwave Grid", "colors": ["#FF71CE", "#01CDFE", "#05FFA1"], "mood": "retro-future"},
        {"name": "Bauhaus Pop", "colors": ["#EAECEE", "#2C3E50", "#E74C3C"], "mood": "geometric"},
        {"name": "Y2K Chrome", "colors": ["#D5D8DC", "#17202A", "#82E0AA"], "mood": "glossy"},
        {"name": "Paper Cutout", "colors": ["#FEF9E7", "#A93226", "#2471A3"], "mood": "crafted"},
        {"name": "Watercolor Flow", "colors": ["#FFFFFF", "#85C1E9", "#F7DC6F"], "mood": "artistic"},
        {"name": "Graffiti Stencil", "colors": ["#1C2833", "#F2F3F4", "#E74C3C"], "mood": "urban"},
        {"name": "Pixel Art 8bit", "colors": ["#212F3D", "#F4D03F", "#58D68D"], "mood": "digital-retro"},
        {"name": "Dark Mode Glass", "colors": ["#000000", "#333333", "#00FFFF"], "mood": "sleek"},
        {"name": "Holographic Foil", "colors": ["#D7BDE2", "#F9E79F", "#A3E4D7"], "mood": "iridescent"},
        {"name": "Cinematic Noir", "colors": ["#000000", "#111111", "#AA0000"], "mood": "dramatic"},
        {"name": "Surreal Dream", "colors": ["#FADBD8", "#1A5276", "#D2B4DE"], "mood": "dreamy"}
    ],
    "Emotional": [
        {"name": "Calm Zen", "colors": ["#808B96", "#FDFEFE", "#566573"], "mood": "peaceful"},
        {"name": "Energetic Sport", "colors": ["#000000", "#FFFF00", "#FF0000"], "mood": "dynamic"},
        {"name": "Trustworthy Blue", "colors": ["#1B4F72", "#FFFFFF", "#AED6F1"], "mood": "reliable"},
        {"name": "Hopeful Green", "colors": ["#196F3D", "#EAFAF1", "#52BE80"], "mood": "optimistic"},
        {"name": "Urgent Red", "colors": ["#922B21", "#F9EBEA", "#CD6155"], "mood": "alert"},
        {"name": "Melancholy Grey", "colors": ["#212F3D", "#B3B6B7", "#5D6D7E"], "mood": "reflective"},
        {"name": "Joyful Yellow", "colors": ["#F1C40F", "#FFFFFF", "#F39C12"], "mood": "happy"},
        {"name": "Romantic Pink", "colors": ["#C0392B", "#FDEDEC", "#EC7063"], "mood": "loving"},
        {"name": "Mysterious Purple", "colors": ["#4A235A", "#F4ECF7", "#8E44AD"], "mood": "mystic"},
        {"name": "Grounding Earth", "colors": ["#5D4037", "#EFEBE9", "#8D6E63"], "mood": "grounded"},
        {"name": "Innocent White", "colors": ["#D7DBDD", "#FFFFFF", "#F0F3F4"], "mood": "pure"},
        {"name": "Nostalgic Sepia", "colors": ["#6E2C00", "#F6DDCC", "#DC7633"], "mood": "memories"},
        {"name": "Excited Orange", "colors": ["#A04000", "#FDF2E9", "#E59866"], "mood": "hyped"},
        {"name": "Serene Aqua", "colors": ["#0E6251", "#E8F8F5", "#48C9B0"], "mood": "calm"},
        {"name": "Focus Indigo", "colors": ["#1A237E", "#E8EAF6", "#3949AB"], "mood": "concentration"}
    ]
}

def generate():
    new_items = []
    id_counter = 200 # Start from DNA_200 to avoid conflicts
    
    for category, items in categories.items():
        for style in items:
            dna_id = f"DNA_{id_counter:03d}"
            
            # Construct Prompt
            prompt = f"{style['name']} style presentation background, {category} category theme, {style['mood']} atmosphere, colors: {', '.join(style['colors'])}, high quality graphic design, architectural composition, {style['mood']} lighting, 4k resolution"
            
            item = {
                "module_id": dna_id,
                "style_name": style['name'],
                "role_bucket": category,
                "design_dna": {
                    "tone_keywords": [category.lower(), style['mood'], "professional", "v2"],
                    "color_palette": {
                        "primary": style['colors'][0],
                        "secondary": style['colors'][1],
                        "accent": style['colors'][2]
                    },
                    "layout_rules": {
                        "composition": "dynamic",
                        "whitespace_ratio": 0.5,
                        "reading_flow": "z-pattern"
                    },
                    "materiality": {
                        "base": "digital",
                        "texture": ["clean", "matte"]
                    },
                    "line_shape": {
                        "line_style": "solid",
                        "stroke_variance": "none"
                    },
                    "typography": {
                        "headline": "sans-serif",
                        "body": "sans-serif",
                        "language_support": ["en"]
                    },
                    "emotional_profile": {
                        "mood": [style['mood']],
                        "tempo": "moderate",
                        "weight": "balanced"
                    }
                },
                "slide_usage": {
                    "best_for": ["presentations", "decks"],
                    "avoid_for": []
                },
                "image_prompt_one_line": prompt,
                "negative_prompt": "low quality, text overlay, watermark, blurry, distorted"
            }
            new_items.append(item)
            id_counter += 1
            
    print(f"Generated {len(new_items)} new designs.")
    
    # Load existing and merge
    try:
        with open('templates.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        current_list = data.get('styles_v2', [])
        # Check for duplicates? For now just append
        current_list.extend(new_items)
        
        data['styles_v2'] = current_list
        
        with open('templates.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
        print("Successfully merged into templates.json")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    generate()
