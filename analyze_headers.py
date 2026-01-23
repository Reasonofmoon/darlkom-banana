import json
import re

def analyze_headers():
    try:
        with open('templates.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        headers = set()
        for item in data:
            report = item.get('full_report', '')
            # Find lines ending with ':'
            matches = re.findall(r'^\s*([^\s:]+):', report, re.MULTILINE)
            headers.update(matches)
            
        print("Unique Headers Found:")
        for h in sorted(headers):
            print(h)
            
    except Exception as e:
        print(e)

if __name__ == "__main__":
    analyze_headers()
