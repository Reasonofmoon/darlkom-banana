import json

# Mapping English design keywords to Korean
EN_TO_KR_MAP = {
    "Creative": "창의적",
    "Rough": "러프한",
    "Personal": "개인적",
    "Brainstorming": "브레인스토밍",
    "Authentic": "진정성 있는",
    "Friendly": "친근한",
    "Professional": "전문적",
    "Trustworthy": "신뢰할 수 있는",
    "Modern": "모던한",
    "Inclusive": "포용적",
    "Clear": "명확한",
    "Playful": "유쾌한",
    "Information": "정보 중심",
    "Girly": "에너제틱 소녀감성",
    "Love": "사랑스러운",
    "Dream": "몽환적",
    "Sparkle": "반짝이는",
    "Shojo Manga": "순정만화 스타일",
    "Isometric": "아이소메트릭",
    "Colorful": "다채로운",
    "High Impact": "강렬한 임팩트",
    "Structure": "구조적",
    "Context": "맥락 중심",
    "Data": "데이터 중심",
    "Focus": "집중",
    "Minimal": "미니멀",
    "Tech": "테크놀로지",
    "Future": "미래지향적",
    "Nature": "자연주의",
    "Brand": "브랜드 아이덴티티",
    "Opening": "오프닝",
    "Emotional": "감성적",
    "Spark": "영감",
    "Agenda": "목차/아젠다",
    "Evidence": "증거/팩트",
    "Conclusion": "결론",
    "Ethos": "신뢰/권위",
    "Action": "행동유도"
}

def translate_elaboration():
    with open('templates.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    styles = data.get('styles_001_100', [])
    count = 0

    for item in styles:
        elab = item.get('elaboration', '')
        if "Migrated from legacy:" in elab:
            # Clean prefix
            clean_text = elab.replace("Migrated from legacy: ", "")
            
            # Words to replace
            words = [w.strip() for w in clean_text.split(',')]
            translated_words = []
            
            for w in words:
                # Try exact match first
                mapped = EN_TO_KR_MAP.get(w)
                if not mapped:
                    # Case insensitive check
                    for k, v in EN_TO_KR_MAP.items():
                        if k.lower() == w.lower():
                            mapped = v
                            break
                
                translated_words.append(mapped if mapped else w)
            
            new_elab = ", ".join(translated_words)
            item['elaboration'] = new_elab
            count += 1

    print(f"Translated elaboration for {count} items.")

    with open('templates.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    translate_elaboration()
