import json

EN_TO_KR_MAP = {
    "Authentic.": "진정성 있는",
    "Modern.": "모던한",
    "Sparkle.": "반짝이는",
    "Colorful.": "다채로운",
    "Memphis": "멤피스 스타일",
    "Flat illustration": "플랫 일러스트레이션",
    "Geometric": "기하학적",
    "Bauhaus": "바우하우스"
}

def fix_remaining_english():
    with open('templates.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    styles = data.get('styles_001_100', [])
    count = 0

    for item in styles:
        elab = item.get('elaboration', '')
        words = [w.strip() for w in elab.split(',')]
        new_words = []
        changed = False
        
        for w in words:
            if w in EN_TO_KR_MAP:
                new_words.append(EN_TO_KR_MAP[w])
                changed = True
            else:
                new_words.append(w)
        
        if changed:
            item['elaboration'] = ", ".join(new_words)
            count += 1

    print(f"Fixed {count} remaining items.")

    with open('templates.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    fix_remaining_english()
