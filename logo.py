#!/usr/bin/env python3
"""
Tekent het merkteken LM als vector.

Als levende tekst is dit logo kwetsbaar: Bodoni Moda is variabel, de browser
kiest zelf een optische grootte, en juist de haarlijnen die de L en de M
leesbaar houden vallen dan weg. Als pad getekend ligt de vorm vast — op elk
scherm, bij elk formaat, ook zonder dat de letter geladen is.

    python3 logo.py            # schrijft logo-lm.svg
    python3 logo.py 40         # met een andere tussenruimte (in font-eenheden)
"""
import sys, pathlib
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen

BRON  = pathlib.Path('/tmp/node_modules/@fontsource-variable/bodoni-moda/files/bodoni-moda-latin-standard-normal.woff2')
GEWICHT, OPTISCH = 700, 11
TUSSEN = int(sys.argv[1]) if len(sys.argv) > 1 else -60     # extra ruimte tussen L en M

font = TTFont(BRON)
font = instantiateVariableFont(font, {'wght': GEWICHT, 'opsz': OPTISCH}, inplace=True)
gs   = font.getGlyphSet()
cmap = font.getBestCmap()
upm  = font['head'].unitsPerEm

def pad_en_breedte(teken):
    naam = cmap[ord(teken)]
    pen  = SVGPathPen(gs)
    gs[naam].draw(pen)
    return pen.getCommands(), gs[naam].width

pad_L, br_L = pad_en_breedte('L')
pad_M, br_M = pad_en_breedte('M')

# hoogte van de hoofdletter, voor een strakke uitsnede
cap = font['OS/2'].sCapHeight if hasattr(font['OS/2'], 'sCapHeight') else int(upm * .7)
verschuif_M = br_L + TUSSEN
totaal_br   = verschuif_M + br_M

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {totaal_br} {cap}" role="img" aria-label="La Main">
<g transform="translate(0 {cap}) scale(1 -1)" fill="currentColor">
<path d="{pad_L}"/>
<path transform="translate({verschuif_M} 0)" d="{pad_M}"/>
</g></svg>'''

uit = pathlib.Path(__file__).parent / 'logo-lm.svg'
uit.write_text(svg, encoding='utf-8')
print(f'{uit.name}  ·  {totaal_br}×{cap} eenheden  ·  tussenruimte {TUSSEN}  ·  {len(svg)} tekens')
