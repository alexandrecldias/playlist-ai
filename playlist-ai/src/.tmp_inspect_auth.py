from pathlib import Path
path = Path('src/lib/spotify/api.ts')
text = path.read_text(encoding='utf-8')
for i, line in enumerate(text.splitlines(), start=1):
    if 'Authorization:' in line:
        print(i, repr(line))
