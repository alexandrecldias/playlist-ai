from pathlib import Path
path = Path('src/lib/spotify/api.ts')
text = path.read_text(encoding='utf-8')
old = 'Authorization: `******'
new = 'Authorization: `Bearer ${accessToken}`'
if old not in text:
    raise SystemExit('pattern not found')
text = text.replace(old, new)
path.write_text(text, encoding='utf-8')
print('patched')
