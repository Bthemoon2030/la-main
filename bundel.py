#!/usr/bin/env python3
"""
Maakt van index.html + stijl.css + app.js + foto/ één enkel bestand:
la-main-compleet.html.

Handig om de site door te sturen of lokaal te bekijken zonder de losse
bestanden. Voor publicatie op GitHub Pages gebruik je gewoon index.html met
stijl.css, app.js en de map foto/ ernaast — dat laadt sneller, omdat de
browser die onderdelen dan apart kan bewaren.

Gebruik: python3 bundel.py
"""
import base64, pathlib, re

hier = pathlib.Path(__file__).parent
html = (hier / 'index.html').read_text(encoding='utf-8')
css  = (hier / 'stijl.css').read_text(encoding='utf-8')
js   = (hier / 'app.js').read_text(encoding='utf-8')

uit = html.replace('<link rel="stylesheet" href="stijl.css">', f'<style>\n{css}\n</style>')
uit = uit.replace('<script src="app.js"></script>', f'<script>\n{js}\n</script>')

def insluiten(m):
    pad = hier / m.group(1)
    if not pad.exists():
        return m.group(0)
    return f'src="data:image/jpeg;base64,{base64.b64encode(pad.read_bytes()).decode()}"'

uit, aantal = re.subn(r'src="(foto/[^"]+\.jpg)"', insluiten, uit)
doel = hier / 'la-main-compleet.html'
doel.write_text(uit, encoding='utf-8')
print(f'{aantal} beelden ingesloten → {doel.name} ({doel.stat().st_size/1024/1024:.2f} MB)')
