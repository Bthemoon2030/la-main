#!/usr/bin/env python3
"""
Zet echte fotografie om in de huisstijl van La Main.

Leg je foto's in de map foto-bron/ met de naam van de plek waar ze horen
(hero.jpg, rug.jpg, linnen.jpg, ...) en draai dit script. Elke foto wordt
op de juiste verhouding gesneden, in de roze-gouden toon gezet en in foto/
weggeschreven, klaar voor de site.

    python3 stijl.py                 # alles wat in foto-bron/ staat
    python3 stijl.py rug hero        # alleen deze twee

De bewerking: kleur deels wegnemen, luminantie door de roze-gouden
kleurtrap halen, zwarten optillen voor een matte film-look, een zachte
gloed om de lichten, wat onscherpte, filmkorrel en een licht vignet.
"""
import os, sys, math
import numpy as np
from PIL import Image, ImageFilter

from beeld import trap, T_ROZE, T_GOUD, T_LINNEN, T_SCHEMER, T_STEEN, T_PARELROZE

HIER = os.path.dirname(os.path.abspath(__file__))
BRON = os.path.join(HIER, 'foto-bron')
UIT  = os.path.join(HIER, 'foto')

PAPIER = np.array([245, 241, 234], dtype=np.float32)   # de papierkleur van de site


# ---------------------------------------------------------------- bewerkingen

def snijden(img, breedte, hoogte, focus=(0.5, 0.42)):
    """Snijdt op de gevraagde verhouding, met het zwaartepunt op `focus`."""
    doel = breedte / hoogte
    b, h = img.size
    bron = b / h
    if bron > doel:                      # bron is breder: zijkanten eraf
        nb = int(round(h * doel)); nh = h
    else:                                # bron is hoger: boven/onder eraf
        nb = b; nh = int(round(b / doel))
    x = int(round((b - nb) * focus[0]))
    y = int(round((h - nh) * focus[1]))
    img = img.crop((x, y, x + nb, y + nh))
    return img.resize((breedte, hoogte), Image.LANCZOS)


def graderen(a, kleurtrap, *, ontkleur=0.50, kracht=0.60, optillen=0.075,
             zachtheid=0.90, warmte=1.0):
    """
    a         : float-array H x W x 3, waarden 0..255
    ontkleur  : hoeveel van de oorspronkelijke kleur wordt weggenomen
    kracht    : hoe sterk de kleurtrap doorwerkt
    optillen  : hoe ver de zwarten omhoog gaan (matte film-look)
    zachtheid : < 1 vlakt het contrast af
    """
    L = (0.2126 * a[:, :, 0] + 0.7152 * a[:, :, 1] + 0.0722 * a[:, :, 2])

    # 1. kleur deels wegnemen, zodat groen en blauw de trap niet tegenwerken
    a = a * (1 - ontkleur) + L[:, :, None] * ontkleur

    # 2. luminantie door de roze-gouden trap halen
    idx = np.clip((L / 255.0 * (len(kleurtrap) - 1)).astype(np.int32), 0, len(kleurtrap) - 1)
    toon = kleurtrap[idx]
    if warmte != 1.0:
        toon = np.clip(toon * np.array([warmte, 1.0, 2 - warmte], dtype=np.float32), 0, 255)
    a = a * (1 - kracht) + toon * kracht

    # 3. contrast afvlakken rond het middengrijs
    a = 128 + (a - 128) * zachtheid

    # 4. zwarten optillen naar de papierkleur: mat, zacht, duur
    a = a * (1 - optillen) + PAPIER * optillen
    return a


def gloed(a, straal, sterkte, drempel=150):
    """Zachte lichtgloed: de lichten worden vervaagd en teruggeschermd."""
    licht = np.clip((a - drempel) / (255 - drempel), 0, 1) * 255
    b = Image.fromarray(licht.astype(np.uint8), 'RGB').filter(
        ImageFilter.GaussianBlur(straal))
    b = np.asarray(b).astype(np.float32)
    return 255 - (255 - a) * (255 - b * sterkte) / 255      # schermen


def afwerken(a, W, H, rng, *, vaag=0.0, korrel=3.4, vignet=0.14, afwijking=1.004):
    if vaag > 0:
        a = np.asarray(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGB')
                       .filter(ImageFilter.GaussianBlur(W * vaag))).astype(np.float32)

    # minieme chromatische afwijking
    if afwijking > 1:
        r = Image.fromarray(np.clip(a[:, :, 0], 0, 255).astype(np.uint8)).resize(
            (int(W * afwijking), int(H * afwijking)), Image.BICUBIC)
        r = np.asarray(r).astype(np.float32)
        oy, ox = (r.shape[0] - H) // 2, (r.shape[1] - W) // 2
        a[:, :, 0] = r[oy:oy + H, ox:ox + W]

    # vignet
    ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)
    vx, vy = (xs / W - 0.5) * 2, (ys / H - 0.5) * 2
    rad = np.sqrt(vx ** 2 + vy ** 2) / math.sqrt(2)
    a = a * (1.0 - vignet * np.clip(rad - 0.42, 0, None) ** 1.4 * 3.0)[:, :, None]

    # filmkorrel
    k = rng.normal(0, 1, (H, W)).astype(np.float32)
    k = np.asarray(Image.fromarray(((k * 40) + 128).clip(0, 255).astype(np.uint8))
                   .filter(ImageFilter.GaussianBlur(0.55))).astype(np.float32)
    a = a + ((k - 128) / 40.0)[:, :, None] * korrel
    return np.clip(a, 0, 255).astype(np.uint8)


def verwerk(bronpad, doelpad, breedte, hoogte, kleurtrap, *, focus=(0.5, 0.42),
            vaag=0.006, gloed_straal=0.02, gloed_sterkte=0.5, kwaliteit=88, **grade):
    img = Image.open(bronpad).convert('RGB')
    img = snijden(img, breedte, hoogte, focus)
    a = np.asarray(img).astype(np.float32)
    a = graderen(a, kleurtrap, **grade)
    a = gloed(a, max(2.0, breedte * gloed_straal), gloed_sterkte)
    a = afwerken(a, breedte, hoogte, np.random.default_rng(7), vaag=vaag)
    Image.fromarray(a, 'RGB').save(doelpad, 'JPEG', quality=kwaliteit,
                                   optimize=True, progressive=True)
    return doelpad


# ---------------------------------------------------------------- de plekken
# Per plek op de site: afmeting, kleurtrap en bewerking. `focus` bepaalt waar
# in de foto het zwaartepunt van de uitsnede ligt (0,0 = linksboven).

PLEKKEN = {
  'hero':            dict(b=1800, h=1100, trap=T_PARELROZE, focus=(.5,.40), vaag=.004, kracht=.62, optillen=.13),
  'rug':             dict(b= 900, h=1200, trap=T_ROZE,      focus=(.5,.38), vaag=.004, optillen=.04, kracht=.52),
  'linnen':          dict(b= 900, h= 900, trap=T_LINNEN,    focus=(.5,.45), vaag=.005),
  'olie-panorama':   dict(b=1800, h= 772, trap=T_GOUD,      focus=(.5,.62), vaag=.003),
  'salon-cel':       dict(b= 980, h=1240, trap=T_LINNEN,    focus=(.5,.42), vaag=.004, optillen=.05, kracht=.52),
  'locatie-cel':     dict(b= 980, h=1240, trap=T_SCHEMER,   focus=(.5,.42), vaag=.005, optillen=.06),
  'olie-huid':       dict(b= 880, h=1100, trap=T_GOUD,      focus=(.5,.42), vaag=.005),
  'onderarm':        dict(b= 900, h=1200, trap=T_PARELROZE, focus=(.5,.42), vaag=.005),
  'ruimte-panorama': dict(b=1800, h= 772, trap=T_LINNEN,    focus=(.5,.52), vaag=.0012, optillen=.02, kracht=.48, zachtheid=1.02, gloed_sterkte=.30),
  'linnen-detail':   dict(b= 900, h=1200, trap=T_STEEN,     focus=(.5,.42), vaag=.005),
  'hoek-schemer':    dict(b= 880, h=1100, trap=T_SCHEMER,   focus=(.5,.42), vaag=.005, optillen=.06),
  'tafel-panorama':  dict(b=1800, h= 772, trap=T_SCHEMER,   focus=(.5,.45), vaag=.004, optillen=.06),
  'nek-panorama':    dict(b=1800, h= 772, trap=T_ROZE,      focus=(.5,.78), vaag=.003),
}

UITBREIDINGEN = ('.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.heic')


def zoek(naam):
    for e in UITBREIDINGEN:
        for kandidaat in (naam + e, naam + e.upper()):
            p = os.path.join(BRON, kandidaat)
            if os.path.exists(p):
                return p
    return None


if __name__ == '__main__':
    os.makedirs(BRON, exist_ok=True)
    os.makedirs(UIT, exist_ok=True)
    gevraagd = sys.argv[1:] or list(PLEKKEN)
    gedaan = gemist = 0
    for naam in gevraagd:
        if naam not in PLEKKEN:
            print(f'  --  {naam}: geen bekende plek op de site'); continue
        bron = zoek(naam)
        if not bron:
            gemist += 1; continue
        cfg = dict(PLEKKEN[naam])
        b, h, t, focus = cfg.pop('b'), cfg.pop('h'), cfg.pop('trap'), cfg.pop('focus')
        doel = os.path.join(UIT, naam + '.jpg')
        verwerk(bron, doel, b, h, t, focus=focus, **cfg)
        print(f'  ok  {naam:16s} {os.path.getsize(doel)/1024:6.1f} kB')
        gedaan += 1
    print(f'\n{gedaan} foto\'s bewerkt, {gemist} plekken nog leeg.')
    if gemist:
        print(f'Leg ontbrekende foto\'s in {os.path.relpath(BRON, HIER)}/ '
              f'met de naam van de plek, bijvoorbeeld rug.jpg')
