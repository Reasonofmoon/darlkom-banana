import json
import os

def migrate():
    # Load backup (Legacy Data)
    try:
        with open('templates.backup.json', 'r', encoding='utf-8') as f:
            legacy_data = json.load(f)
    except FileNotFoundError:
        print("Error: templates.backup.json not found!")
        return

    # Load current V2 (New Schema items)
    try:
        with open('templates.json', 'r', encoding='utf-8') as f:
            v2_data = json.load(f)
    except FileNotFoundError:
        v2_data = {"styles_v2": []}

    legacy_list = legacy_data.get('styles_001_100', [])
    new_v2_list = v2_data.get('styles_v2', [])
    
    # Existing IDs in V2 to avoid duplicates
    existing_ids = {item['module_id'] for item in new_v2_list if 'module_id' in item}

    print(f"Found {len(legacy_list)} legacy items.")
    
    for item in legacy_list:
        # Generate new ID
        legacy_id = item.get('id', 0)
        new_id = f"DNA_{legacy_id:03d}"
        
        if new_id in existing_ids:
            continue # Skip if already exists (DNA_001, 002, 003 usually exist)

        # Default fallback values for V2 Schema
        role = item.get('role_bucket', 'Structure')
        title = item.get('title', 'Untitled Style')
        
        # Color mapping
        legacy_palette = item.get('palette', {})
        primary = legacy_palette.get('background', '#111111')
        text = legacy_palette.get('text', '#ffffff')
        accents = legacy_palette.get('accents', [])
        accent = accents[0] if accents else '#00FF00'
        secondary = accents[1] if len(accents) > 1 else text

        # Construct V2 Object
        migrated_item = {
            "module_id": new_id,
            "style_name": title,
            "role_bucket": role,
            "design_dna": {
                "tone_keywords": item.get('slide_intent', []),
                "color_palette": {
                    "primary": primary,
                    "secondary": secondary,
                    "accent": accent
                },
                "layout_rules": {
                    "composition": "determined_by_role", # Placeholder logic
                    "whitespace_ratio": 0.5,
                    "reading_flow": "z-pattern"
                },
                "materiality": {
                    "base": "digital_screen",
                    "texture": []
                },
                "line_shape": {
                    "line_style": "default",
                    "stroke_variance": "none"
                },
                "typography": {
                    "headline": "sans-serif",
                    "body": "sans-serif",
                    "language_support": ["en"]
                },
                "emotional_profile": {
                    "mood": [],
                    "tempo": "moderate",
                    "weight": "balanced"
                }
            },
            "slide_usage": {
                "best_for": [],
                "avoid_for": []
            },
            "image_prompt_one_line": item.get('image_prompt', ''),
            "negative_prompt": item.get('negative_prompt', '')
        }
        
        # Naive "Enhancement" based on keywords
        keywords = (title + " " + role).lower()
        if "minimal" in keywords:
            migrated_item['design_dna']['layout_rules']['whitespace_ratio'] = 0.8
        if "grid" in keywords:
            migrated_item['design_dna']['layout_rules']['composition'] = "modular_grid"
        if "neon" in keywords:
            migrated_item['design_dna']['materiality']['base'] = "dark_glass"
        if "paper" in keywords:
            migrated_item['design_dna']['materiality']['base'] = "paper"
            migrated_item['design_dna']['materiality']['texture'].append("grain")

        new_v2_list.append(migrated_item)

    # Re-save to templates.json
    final_data = {
        "deck_consistency": v2_data.get('deck_consistency', {}),
        "styles_v2": new_v2_list
    }

    with open('templates.json', 'w', encoding='utf-8') as f:
        json.dump(final_data, f, indent=2, ensure_ascii=False)

    print(f"Migration Complete. Total items: {len(new_v2_list)}")

if __name__ == "__main__":
    migrate()
