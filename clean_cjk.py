import json
import re

def clean_database():
    with open('templates.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    # Regex to match any CJK characters (Chinese/Japanese/Korean Hanja)
    # Range includes: 
    # U+3000-U+303F (CJK Symbols and Punctuation)
    # U+3040-U+309F (Hiragana)
    # U+30A0-U+30FF (Katakana)
    # U+FF00-U+FFEF (Halfwidth and Fullwidth Forms)
    # U+4E00-U+9FAF (CJK Unified Ideographs - Common Kanji/Hanja)
    # But we want to KEEP Korean Hangul (U+AC00-U+D7A3)
    
    # So we remove Japanese/Chinese ranges specifically.
    jp_ch_pattern = re.compile(r'[\u3040-\u30ff\u4e00-\u9faf\u3400-\u4dbf]')
    
    # Fallback map for stubborn mixed terms that might just need deletion of the JP part
    # or replacement with English if context is lost.
    
    def recursive_clean(obj):
        if isinstance(obj, dict):
            return {k: recursive_clean(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [recursive_clean(i) for i in obj]
        elif isinstance(obj, str):
            # If string contains Japanese/Chinese chars, try to clean it
            if jp_ch_pattern.search(obj):
                # Strategy: 
                # 1. Provide specific manual overrides for known remaining issues if any
                # 2. Aggressively remove the characters if they are mixed
                new_str = jp_ch_pattern.sub('', obj)
                # Cleanup double spaces or weird punctuation left behind
                new_str = re.sub(r'\s+', ' ', new_str).strip()
                return new_str
            return obj
        return obj

    cleaned_data = recursive_clean(data)
    
    with open('templates.json', 'w', encoding='utf-8') as f:
        json.dump(cleaned_data, f, indent=2, ensure_ascii=False)
        print("Aggressive cleaning complete.")

if __name__ == "__main__":
    clean_database()
