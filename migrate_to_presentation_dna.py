import json
import os

def migrate_db():
    source_path = 'templates.json'
    
    if not os.path.exists(source_path):
        print("templates.json not found.")
        return

    with open(source_path, 'r', encoding='utf-8') as f:
        old_data = json.load(f)

    # If already in new format, skip
    if isinstance(old_data, dict) and "styles_001_100" in old_data:
        print("Data is already in new format.")
        return

    new_db = {
        "deck_consistency": {
            "global_rule": "Consistent 16:9 layout with minimal clutter.",
            "anchor_motif": "Top-left geometric marker",
            "palette_harmony_rule": "Limit to 3 main colors per slide",
            "typography_mood_hint": "Clean, Sans-serif, deeply legible"
        },
        "styles_001_100": []
    }

    print(f"Migrating {len(old_data)} items...")

    for item in old_data:
        # Heuristic to guess role
        title_lower = item.get('title', '').lower()
        role = "Structure"
        if "notebook" in title_lower or "doodle" in title_lower:
            role = "Opening / Emotional"
        elif "neon" in title_lower or "cyber" in title_lower:
            role = "High Impact"
        elif "b&w" in title_lower or "minimal" in title_lower:
            role = "Content / Data"

        new_item = {
            "id": item.get('id'),
            "title": item.get('title'),
            "role_bucket": role,
            "slide_intent": ["title", "content"] if role == "Structure" else ["impact"],
            "image_prompt_one_line": item.get('prompt', "No prompt available."),
            "negative_prompt": "clutter, text overlay, chaotic, low resolution, watermark",
            "elaboration": f"Migrated from legacy: {item.get('tone', '')}",
            "palette": item.get('palette'), # Keep strictly for backward compat in rendering
            "fidelity_score": 0 # Default for tuning loop
        }
        new_db["styles_001_100"].append(new_item)

    # Backup logic
    # with open('templates_backup.json', 'w', encoding='utf-8') as f:
    #    json.dump(old_data, f, indent=2)

    with open(source_path, 'w', encoding='utf-8') as f:
        json.dump(new_db, f, indent=2, ensure_ascii=False)
    
    print("Migration complete. templates.json updated to Presentation DNA structure.")

if __name__ == "__main__":
    migrate_db()
