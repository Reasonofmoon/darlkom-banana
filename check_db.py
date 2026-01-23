import json
import re

def detect_japanese():
    with open('templates.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    japanese_chars = re.compile(r'[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]')
    
    found = False
    for item in data:
        # Check specific fields that might have residues
        text_dump = json.dumps(item, ensure_ascii=False)
        matches = japanese_chars.findall(text_dump)
        if matches:
            print(f"ID {item.get('id')}: Found {len(matches)} Japanese chars: {matches[:5]}...")
            found = True
            
    if not found:
        print("No Japanese characters found.")

if __name__ == "__main__":
    detect_japanese()
