import json
import re

def has_japanese(text):
    # Hiragana, Katakana, Kanji ranges
    jp_pattern = re.compile(r'[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]')
    return bool(jp_pattern.search(text))

def scan_and_translate():
    with open('templates.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    styles = data.get('styles_001_100', [])
    jp_count = 0
    
    for item in styles:
        elab = item.get('elaboration', '')
        if has_japanese(elab):
            print(f"Found Japanese in ID {item.get('id')}: {elab}")
            jp_count += 1
            
    print(f"Total items with Japanese: {jp_count}")

if __name__ == "__main__":
    scan_and_translate()
