#!/usr/bin/env python3
"""
Genereert de beeldvlakken voor La Main.

Werkwijze: eerst wordt een zacht lichtveld opgebouwd — een lichtbron, een
vormrand die aan een lichaam of stof doet denken, en een schaduwmassa. Dat
veld wordt vervolgens door een roze-gouden kleurtrap gehaald, onscherp
gemaakt, en afgewerkt met filmkorrel en een licht vignet.

Door met een kleurtrap te werken in plaats van kleuren te middelen, blijft
het roze-goud zuiver in plaats van naar bruin weg te zakken.

Gebruik:   python3 beeld.py
Resultaat: foto/*.jpg
"""
import numpy as np
from PIL import Image, ImageFilter
import os, math

UIT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'foto')
os.makedirs(UIT, exist_ok=True)


# ---------------------------------------------------------------- hulpmiddelen

def ruis(h, w, schaal, rng):
    """Zachte waarde-ruis: lage resolutie opgeblazen met bicubische interpolatie."""
    kh, kw = max(2, int(h / schaal)), max(2, int(w / schaal))
    klein = rng.random((kh, kw)).astype(np.float32)
    beeld = Image.fromarray((klein * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
    return np.asarray(beeld).astype(np.float32) / 255.0


def trap(hexen, n=256):
    """Bouwt een kleurtrap (donker → licht) als opzoektabel."""
    punten = []
    for h in hexen:
        h = h.lstrip('#')
        punten.append([int(h[i:i+2], 16) for i in (0, 2, 4)])
    punten = np.array(punten, dtype=np.float32)
    x = np.linspace(0, 1, len(punten))
    xi = np.linspace(0, 1, n)
    return np.stack([np.interp(xi, x, punten[:, k]) for k in range(3)], axis=1)


def vlek(X, Y, cx, cy, sx, sy, hoek):
    """Organische lichtvlek: een gedraaide gaussische vorm."""
    c, s = math.cos(hoek), math.sin(hoek)
    dx, dy = X - cx, Y - cy
    u = dx * c + dy * s
    v = -dx * s + dy * c
    return np.exp(-((u / sx) ** 2 + (v / sy) ** 2))


# ---------------------------------------------------------------- de generator

def maak(naam, w, h, kleurtrap, zaad, *, vorm=0.7, hoek=0, licht=(0.4, 0.32),
         helderheid=0.62, contrast=1.0, vaag=0.030, korrel=4.0,
         vignet=0.16, kwaliteit=86):
    rng = np.random.default_rng(zaad)
    W, H = w, h
    ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)
    X, Y = xs / W, ys / H
    ar = W / H

    # domeinvervorming, zodat niets perfect elliptisch blijft
    wx = ruis(H, W, min(W, H) / 3.0, rng) - 0.5
    wy = ruis(H, W, min(W, H) / 3.4, rng) - 0.5
    Xw = X + wx * 0.14
    Yw = Y + wy * 0.14

    # ------------------------------------------------ het lichtveld opbouwen
    L = np.full((H, W), 0.46, dtype=np.float32)

    lx, ly = licht
    L += vlek(Xw, Yw, lx, ly, 0.40 * ar, 0.38, 0.0) * 0.46
    L += vlek(Xw, Yw, lx + 0.05, ly - 0.04, 0.17 * ar, 0.15, 0.4) * 0.26

    # tweede, zachtere lichtval elders in het beeld
    L += vlek(Xw, Yw, rng.uniform(0.15, 0.85), rng.uniform(0.15, 0.85),
              rng.uniform(0.22, 0.36) * ar, rng.uniform(0.22, 0.36),
              rng.uniform(0, math.pi)) * 0.14

    # schaduwmassa in de hoek weg van het licht
    sx_c = 0.95 if lx < 0.5 else 0.05
    sy_c = 0.95 if ly < 0.5 else 0.05
    L -= vlek(Xw, Yw, sx_c, sy_c, 0.52 * ar, 0.50, 0.0) * 0.40
    L -= vlek(Xw, Yw, rng.uniform(0, 1), rng.uniform(0.55, 1.0),
              rng.uniform(0.25, 0.45) * ar, rng.uniform(0.22, 0.38),
              rng.uniform(0, math.pi)) * 0.18

    # ------------------------------------------------ de vormrand
    # Een gebogen scheiding met een lichtzoom erlangs: dat is wat een
    # onscherpe foto van een schouder, heup of stofplooi herkenbaar maakt.
    if vorm > 0:
        # De rand mag onder een hoek lopen; een schuine of bijna verticale
        # scheiding leest als een lichaam, een horizontale als een horizon.
        a = math.radians(hoek)
        ca, sa = math.cos(a), math.sin(a)
        Xa, Ya = (X - 0.5) * ar, (Y - 0.5)
        U = Xa * ca + Ya * sa
        V = -Xa * sa + Ya * ca

        fase = rng.uniform(0, math.tau)
        amp = rng.uniform(0.10, 0.19)
        hell = rng.uniform(-0.42, 0.42)
        basis = rng.uniform(-0.14, 0.16)
        golf = rng.uniform(0.6, 1.3)
        rand = basis + hell * U + amp * np.sin(U * math.pi * golf + fase)
        rand += (ruis(H, W, min(W, H) / 2.0, rng) - 0.5) * 0.07
        zacht = rng.uniform(0.055, 0.105)
        d = (V - rand) / zacht
        onder = 1.0 / (1.0 + np.exp(-d))                       # 0 ervoor, 1 erachter
        L -= onder * 0.17 * vorm                                # schaduwzijde, ingehouden
        L += np.exp(-(d + 0.9) ** 2 / 1.8) * 0.31 * vorm        # lichtzoom op de rand

    # fijne structuur, zodat het veld niet klinisch glad wordt
    L += (ruis(H, W, min(W, H) / 7.0, rng) - 0.5) * 0.07

    # ------------------------------------------------ toonverdeling
    L = np.clip(L, 0, 1)
    L = 0.5 + (L - 0.5) * contrast
    L = np.clip(L, 0, 1)
    # helderheid > 0.5 tilt het beeld naar de lichte helft van de trap
    g = math.log(max(1e-3, 1 - helderheid)) / math.log(0.5)
    L = np.clip(L, 1e-4, 1) ** g

    # ------------------------------------------------ kleurtrap toepassen
    idx = np.clip((L * (len(kleurtrap) - 1)).astype(np.int32), 0, len(kleurtrap) - 1)
    beeld = kleurtrap[idx]

    # ------------------------------------------------ lensvervaging
    img = Image.fromarray(np.clip(beeld, 0, 255).astype(np.uint8), 'RGB')
    img = img.filter(ImageFilter.GaussianBlur(radius=max(2.0, W * vaag)))
    beeld = np.asarray(img).astype(np.float32)

    # ------------------------------------------------ chromatische afwijking
    r = Image.fromarray(beeld[:, :, 0].astype(np.uint8)).resize(
        (int(W * 1.005), int(H * 1.005)), Image.BICUBIC)
    r = np.asarray(r).astype(np.float32)
    oy, ox = (r.shape[0] - H) // 2, (r.shape[1] - W) // 2
    beeld[:, :, 0] = r[oy:oy + H, ox:ox + W]

    # ------------------------------------------------ zacht vignet
    vx, vy = (X - 0.5) * 2, (Y - 0.5) * 2
    rad = np.sqrt(vx ** 2 + vy ** 2) / math.sqrt(2)
    beeld *= (1.0 - vignet * np.clip(rad - 0.42, 0, None) ** 1.4 * 3.0)[:, :, None]

    # ------------------------------------------------ filmkorrel
    k = rng.normal(0, 1, (H, W)).astype(np.float32)
    k = np.asarray(Image.fromarray(((k * 40) + 128).clip(0, 255).astype(np.uint8))
                   .filter(ImageFilter.GaussianBlur(0.55))).astype(np.float32)
    beeld += ((k - 128) / 40.0)[:, :, None] * korrel

    beeld = np.clip(beeld, 0, 255).astype(np.uint8)
    pad = os.path.join(UIT, naam + '.jpg')
    Image.fromarray(beeld, 'RGB').save(pad, 'JPEG', quality=kwaliteit,
                                       optimize=True, progressive=True)
    return pad


# ---------------------------------------------------------------- kleurtrappen
# Alle trappen lopen van diep warm bruin naar bijna wit, met roze-goud als
# hart. Wil je de site koeler of warmer, pas dan alleen deze waarden aan.

T_ROZE    = trap(['#5B392E', '#96654E', '#C89579', '#E7BB9E', '#F7D9C4', '#FEEFE4', '#FFFBF7'])
T_GOUD    = trap(['#5E4131', '#A5765A', '#D2A67E', '#EECAA3', '#F9E4CD', '#FEF6EB', '#FFFDFA'])
T_LINNEN  = trap(['#63504A', '#9C8377', '#CBB4A6', '#E7D6C9', '#F5ECE2', '#FDF9F4', '#FFFEFD'])
T_SCHEMER = trap(['#2B1E19', '#583C2E', '#8E6248', '#BE8D6C', '#E2B597', '#F5D7BE', '#FDEEE0'])
T_STEEN   = trap(['#5B4A44', '#927D74', '#BCA79C', '#DDC9BD', '#EFE3D9', '#FBF6F0', '#FFFEFC'])
T_PARELROZE = trap(['#654237', '#A2735E', '#D2A183', '#EDC4A9', '#F9DDCB', '#FEF3EA', '#FFFDFA'])


BEELDEN = [
    # naam              breedte hoogte trap        zaad  instellingen
    ('hero',              1800, 1100, T_PARELROZE,  11, dict(vorm=0.60, hoek=-24, licht=(0.46, 0.34), helderheid=0.78, contrast=0.84, vaag=0.034, vignet=0.12, korrel=3.2)),
    ('rug',                900, 1200, T_ROZE,       23, dict(vorm=0.95, hoek=-38, licht=(0.32, 0.24), helderheid=0.70, contrast=1.02, vaag=0.028)),
    ('linnen',             900,  900, T_LINNEN,     31, dict(vorm=0.72, hoek=52,  licht=(0.26, 0.20), helderheid=0.78, contrast=0.92, vaag=0.030)),
    ('olie-panorama',     1800,  772, T_GOUD,       43, dict(vorm=0.78, hoek=-62, licht=(0.66, 0.26), helderheid=0.72, contrast=1.00, vaag=0.026)),
    ('salon-cel',          980, 1240, T_LINNEN,     53, dict(vorm=0.60, hoek=28,  licht=(0.24, 0.26), helderheid=0.80, contrast=0.90, vaag=0.032)),
    ('locatie-cel',        980, 1240, T_SCHEMER,    61, dict(vorm=0.90, hoek=-30, licht=(0.72, 0.22), helderheid=0.50, contrast=1.08, vaag=0.030)),
    ('olie-huid',          880, 1100, T_GOUD,       67, dict(vorm=0.92, hoek=41,  licht=(0.64, 0.28), helderheid=0.72, contrast=1.02, vaag=0.026)),
    ('onderarm',           900, 1200, T_PARELROZE,  73, dict(vorm=0.90, hoek=-56, licht=(0.34, 0.22), helderheid=0.74, contrast=1.00, vaag=0.026)),
    ('ruimte-panorama',   1800,  772, T_LINNEN,     83, dict(vorm=0.64, hoek=71,  licht=(0.30, 0.28), helderheid=0.80, contrast=0.90, vaag=0.028)),
    ('linnen-detail',      900, 1200, T_STEEN,      91, dict(vorm=0.82, hoek=34,  licht=(0.28, 0.24), helderheid=0.78, contrast=0.98, vaag=0.026)),
    ('hoek-schemer',       880, 1100, T_SCHEMER,    97, dict(vorm=0.74, hoek=-47, licht=(0.74, 0.20), helderheid=0.52, contrast=1.06, vaag=0.030)),
    ('tafel-panorama',    1800,  772, T_SCHEMER,   103, dict(vorm=0.82, hoek=-74, licht=(0.64, 0.24), helderheid=0.54, contrast=1.04, vaag=0.028)),
    ('nek-panorama',      1800,  772, T_ROZE,      113, dict(vorm=0.88, hoek=66,  licht=(0.36, 0.26), helderheid=0.72, contrast=1.02, vaag=0.026)),
]

if __name__ == '__main__':
    totaal = 0
    for naam, w, h, t, zaad, extra in BEELDEN:
        pad = maak(naam, w, h, t, zaad, **extra)
        kb = os.path.getsize(pad) / 1024
        totaal += kb
        print(f'{naam:18s} {kb:6.1f} kB')
    print(f'{"totaal":18s} {totaal:6.1f} kB')
