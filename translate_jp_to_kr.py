import json
import re

# Dictionary for translating residual Japanese to Korean
TRANSLATION_MAP_KR = {
    # Headers
    "全体デザイン設定": "전체 디자인 설정",
    "トーン": "톤",
    "ビジュアル・アイデンティティ": "비주얼 아이덴티티",
    "背景色": "배경색",
    "文字色": "글자색",
    "アクセントカラー": "강조색",
    "画像スタイル": "이미지 스타일",
    "特徴": "특징",
    "イメージャリ": "이미지",
    "構成": "구성",
    "タイポグラフィ": "타이포그래피",
    "見出し": "헤드라인",
    "スタイル": "스타일",
    "質感": "질감",
    "エフェクト": "효과",
    "形状": "모양/형태",
    "色数": "색상 수",
    "構造": "구조",
    "雰囲気": "분위기",
    "照明": "조명",
    "線画": "선화",
    "本文": "본문",
    "数字": "숫자",
    "モチーフ": "모티브",
    "フォント": "폰트",
    "タイトル": "제목",
    "写真": "사진",
    "効果": "효과",
    "要素": "요소",
    "視点": "시점",
    "色の見え方": "색상의 보임",
    "色使い": "색상 사용",
    "色調": "색조",
    "エージェンティック要素": "에이전틱 요소",
    "瞳": "눈동자",
    
    # Adjectives, Prepositions, & Misc
    "または": "또는",
    "の": "의",
    "を用いた": "를 사용한",
    "に描かれた": "에 그려진",
    "への": "에 대한",
    "と": "와",
    "風": "풍",
    "な": "한",
    "非常に": "매우",
    "薄い": "옅은",
    "散る": "흩날리는",
    "入った": "들어간",
    "大きな": "큰",
    "で": "이고",
    "丸みを帯びた": "둥근",
    "明確な": "명확한",
    "階層": "계층",
    "装飾的": "장식적",
    "不揃いな": "고르지 않은",
    "黒板": "칠판",
    "粉": "가루",
    "かすれ": "갈라짐",
    "消し跡": "지운 자국",
    "飾り枠": "장식 테두리",
    "フリーハンド": "프리핸드",
    "指紋のついた": "지문이 묻은",
    "わずかな": "약간의",
    "丸っこい": "동글동글한",
    "粘土で作ったような": "점토로 만든 듯한",
    "立体文字": "입체 문자",
    "線": "선",
    "のみで構成された": "만으로 구성된",
    "均一な": "균일한",
    "太さ": "굵기",
    "圧倒的な": "압도적인",
    "大きく使っても": "크게 사용해도",
    "圧迫感のない": "압박감이 없는",
    "細さ": "가늘기",
    "彩度を上げた": "채도를 높인",
    "原色": "원색",
    "おもちゃ": "장난감",
    "プラスチック": "플라스틱",
    "光沢": "광택",
    "浅い被写界深度": "얕은 피사계 심도",
    "ボケ足": "보케(배경 흐림)",
    "俯瞰": "조감(위에서 내려다봄)",
    "鉄道模型": "철도 모형",
    "太い": "굵은",
    "丸い": "둥근",
    "子供っぽい": "아이 같은",
    "遊び心": "장난기",
    "情報的": "정보적",
    "Japaneseは": "일본어는",
    "Japaneseに": "일본어에",
    "をUsing": "를 사용하여",
    "Draw with maximum precision": "최대 정밀도로 묘사",
    "手足の大きな": "손발이 큰",
    "微細な": "미세한",
    "浮遊する": "부유하는",
    "相互接続された": "상호 연결된",
    "バラの花": "장미 꽃",
    "スクリーントーン": "스크린톤",
    "ライトグレー": "라이트 그레이",
    "罫線入りの紙": "줄이 그어진 종이",
    "背景に": "배경에",
    "目": "눈",
    "スClean": "클린"
}

def translate_recursive_kr(data):
    if isinstance(data, dict):
        return {k: translate_recursive_kr(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [translate_recursive_kr(item) for item in data]
    elif isinstance(data, str):
        text = data
        # Check for Japanese characters including hiragana/katakana/kanji
        if re.search(r'[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]', text):
            # Sort keys by length desc to avoid partial matches
            sorted_keys = sorted(TRANSLATION_MAP_KR.keys(), key=len, reverse=True)
            for jp in sorted_keys:
                en = TRANSLATION_MAP_KR[jp]
                text = text.replace(jp, en)
        return text
    else:
        return data

def process_translation_kr():
    with open('templates.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    translated = translate_recursive_kr(data)
        
    with open('templates.json', 'w', encoding='utf-8') as f:
        json.dump(translated, f, indent=2, ensure_ascii=False)
        print("Database translation to Korean complete.")

if __name__ == "__main__":
    process_translation_kr()
