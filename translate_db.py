import json
import re

TRANSLATION_MAP = {
    # Headers
    "全体デザイン設定": "Overall Design Config",
    "トーン": "Tone",
    "ビジュアル・アイデンティティ": "Visual Identity",
    "背景色": "Background Color",
    "文字色": "Text Color",
    "アクセントカラー": "Accent Color",
    "画像スタイル": "Image Style",
    "特徴": "Features",
    "イメージャリ": "Imagery",
    "構成": "Composition",
    "タイポグラフィ": "Typography",
    "見出し": "Headers",
    "スタイル": "Style",
    "質感": "Texture",
    "エフェクト": "Effects",
    "形状": "Shapes",
    "色数": "Color Count",
    "構造": "Structure",
    "雰囲気": "Atmosphere",
    "照明": "Lighting",
    "線画": "Line Work",
    "本文": "Body Text",
    "数字": "Numerals",
    "モチーフ": "Motifs",
    "フォント": "Fonts",
    "タイトル": "Title",
    "写真": "Photography",
    "効果": "Effects",
    "要素": "Elements",
    "視点": "Perspective",
    "色の見え方": "Color Appearance",
    "色使い": "Color Usage",
    "色調": "Color Tone",
    "エージェンティック要素": "Agentic Elements",
    
    # Korean Headers (Found in list)
    "구성": "Composition",
    "글자색": "Text Color",
    "배경색": "Background Color",
    "스타일": "Style",
    "제목": "Title",
    "질감": "Texture",
    "타이포그래피": "Typography",
    "특징": "Features",
    "형상": "Shapes",

    # Values (Common)
    "なし": "None",
    "あり": "Yes",
    "白": "White",
    "黒": "Black",
    "青": "Blue",
    "赤": "Red",
    "黄": "Yellow",
    "緑": "Green",
    "金": "Gold",
    "銀": "Silver",
    "和紙": "Washi Paper",
    "モダン": "Modern",
    "シンプル": "Simple",
    "レトロ": "Retro",
    "未来": "Future",
    "伝統": "Traditional",
    "高級": "Luxury",
    "洗練": "Sophisticated",
    "静寂": "Quiet/Serene",
    "可愛い": "Cute/Kawaii"
}

def translate_text(text):
    if not isinstance(text, str): return text
    # Simple replace for headers
    for k, v in TRANSLATION_MAP.items():
        text = text.replace(f"{k}:", f"{v}:")
        text = text.replace(f"{k}", f"{v}")
    return text

def parse_report_to_structure(report_text):
    """
    Parses the indented text report into a nested dictionary structure.
    """
    lines = report_text.split('\n')
    structure = {}
    current_section = None
    current_subsection = None
    
    # Very basic parser designed for the specific indentation style of this project
    # Level 0: Title or garbage
    # Level 1: "Overall Design Config:" (0 spaces)
    # Level 2: "  Tone:" (2 spaces)
    # Level 3: "    Background Color:" (4 spaces)
    
    root = {"Sections": {}}
    
    stack = [root] # Stack of (indent_level, dict_ref)
    
    # Normalize indentation helper
    def get_indent(line):
        return len(line) - len(line.lstrip())

    current_dict = root["Sections"]
    
    for line in lines:
        stripped = line.strip()
        if not stripped: continue
        
        # Check if it's a key-value or just text
        indent = get_indent(line)
        
        # Heuristic translation of the line content
        translated_line = translate_text(stripped)
        
        parts = translated_line.split(':', 1)
        key = parts[0].strip().replace('"','')
        val = parts[1].strip().replace('"','') if len(parts) > 1 else ""
        
        # If line ends with ':' it is a section header
        if stripped.endswith(':'):
             # It's a new section/subsection
             new_section = {}
             # Find parent based on indent
             # This is a simplified logic: if indent > pervious, add to previous. 
             # If indent <, pop stack.
             
             # Actually, simpler approach for "Boxes":
             # We just want top-level categories: Tone, Visual Identity, Typography.
             # Tone is typically a value.
             # Visual Identity has sub-keys.
             pass

    # New Approach: Regex based broad categorization for the specific UI requirements
    # We want to extract: Tone, Visual Identity, Typography, Image Style.
    
    extracted = {
        "Tone": "",
        "Visual Identity": {},
        "Typography": {},
        "Image Style": {}
    }
    
    # Regex extractors
    tone_match = re.search(r'(?:Tone|トーン):\s*"?(.*?)"?\s*$', report_text, re.MULTILINE)
    if tone_match:
        extracted["Tone"] = translate_text(tone_match.group(1))

    # We will just parse the text "loosely" into the target structure for the UI
    # Visual Identity
    vi_bg = re.search(r'(?:Background Color|背景色):\s*"?(.*?)"?\s*$', report_text, re.MULTILINE)
    vi_text = re.search(r'(?:Text Color|文字色):\s*"?(.*?)"?\s*$', report_text, re.MULTILINE)
    vi_accent = re.search(r'(?:Accent Color|アクセントカラー):\s*"?(.*?)"?\s*$', report_text, re.MULTILINE)
    
    if vi_bg: extracted["Visual Identity"]["Background"] = translate_text(vi_bg.group(1))
    if vi_text: extracted["Visual Identity"]["Text"] = translate_text(vi_text.group(1))
    if vi_accent: extracted["Visual Identity"]["Accents"] = translate_text(vi_accent.group(1))
    
    # Typography
    typo_head = re.search(r'(?:Headers|見出し):\s*"?(.*?)"?\s*$', report_text, re.MULTILINE)
    typo_style = re.search(r'(?:Style|スタイル):\s*"?(.*?)"?\s*$', report_text, re.MULTILINE)
    
    if typo_head: extracted["Typography"]["Headers"] = translate_text(typo_head.group(1))
    if typo_style: extracted["Typography"]["Style"] = translate_text(typo_style.group(1))
    
    # Image Style
    img_feat = re.search(r'(?:Features|特徴):\s*"?(.*?)"?\s*$', report_text, re.MULTILINE)
    img_tex = re.search(r'(?:Texture|質感):\s*"?(.*?)"?\s*$', report_text, re.MULTILINE)
    img_comp = re.search(r'(?:Composition|構成):\s*"?(.*?)"?\s*$', report_text, re.MULTILINE)
    
    if img_feat: extracted["Image Style"]["Features"] = translate_text(img_feat.group(1))
    if img_tex: extracted["Image Style"]["Texture"] = translate_text(img_tex.group(1))
    if img_comp: extracted["Image Style"]["Composition"] = translate_text(img_comp.group(1))

    return extracted

def process_file():
    with open('templates.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    for item in data:
        # 1. Translate Title (ko_title usually has english or korean, we revert to title if english)
        # Actually existing English titles are in "title". "ko_title" is mixed.
        # We can just use "title" as primary display if we want English.
        if "title" in item:
            item["display_title"] = item["title"] # Use the English title
            
        # 2. Translate Tone
        if "tone" in item:
            item["tone"] = translate_text(item["tone"])
            
        # 3. Create Structured Report
        if "full_report" in item:
            item["structured_report"] = parse_report_to_structure(item["full_report"])
            # Update full_report text for legacy/render engine references
            item["full_report"] = translate_text(item["full_report"])
            
    with open('templates.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        print("Updated templates.json successfully.")

if __name__ == "__main__":
    process_file()
