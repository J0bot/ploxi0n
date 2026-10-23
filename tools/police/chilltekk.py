# LA POLICE CHILL-TEKK DU XERBOXION (0.96). RS-7 (23.10) : « on pourrait faire notre alphabet custom du xerboxion, la police chill-tekk ».
# Un alphabet au trait unique, dessiné sur une grille (700 de haut), puis épaissi : chaque trait devient un ruban, chaque point une jonction ronde,
# le tout fondu en un seul contour (skia-pathops), écrit en TTF + WOFF2 (fontTools). Unicase : les minuscules sont les capitales.
# La grammaire ionique d'abord :  O = ON, le chaos (un cercle parfait) · I = l'observateur (un trait et son œil) · A = un koin (un triangle)
# · X = le xeroction (la croix) ; les autres lettres ont les coins COUPÉS en biais (les vieux koins des planches de RS-7).
# Lancer :  python tools/police/chilltekk.py public/fonts   (il faut fonttools, brotli, skia-pathops : un venv à part)
#   --graisse 70 (l'épaisseur du trait, en unités ; 1000 par em) · --nom ChillTekk
import math, sys, argparse
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
import pathops

C = 'c'   # un cercle : (C, cx, cy, r)
def cercle(cx, cy, r): return (C, cx, cy, r)

# ---- les lettres : une liste de traits ; un trait = une liste de points, ou un cercle. Largeur de la boîte : CHASSE (sinon 560) ----
L = {
  'A': [[(40, 0), (280, 700), (520, 0)], [(130, 230), (430, 230)]],
  'B': [[(80, 0), (80, 700), (380, 700), (460, 620), (460, 430), (380, 350), (80, 350)], [(380, 350), (480, 270), (480, 80), (400, 0), (80, 0)]],
  'C': [[(480, 620), (400, 700), (160, 700), (80, 620), (80, 80), (160, 0), (400, 0), (480, 80)]],
  'D': [[(80, 0), (80, 700), (340, 700), (480, 560), (480, 140), (340, 0), (80, 0)]],
  'E': [[(480, 700), (80, 700), (80, 0), (480, 0)], [(80, 350), (380, 350)]],
  'F': [[(480, 700), (80, 700), (80, 0)], [(80, 350), (380, 350)]],
  'G': [[(480, 620), (400, 700), (160, 700), (80, 620), (80, 80), (160, 0), (400, 0), (480, 80), (480, 330), (300, 330)]],
  'H': [[(80, 0), (80, 700)], [(480, 0), (480, 700)], [(80, 350), (480, 350)]],
  'I': [[(150, 0), (150, 540)], cercle(150, 650, 42)],   # l'observateur : un trait et son œil (étroit : il ne fait pas de trou dans XERB0XI0N)
  'J': [[(420, 700), (420, 80), (340, 0), (160, 0), (80, 80), (80, 200)]],
  'K': [[(80, 0), (80, 700)], [(480, 700), (80, 300)], [(220, 440), (480, 0)]],
  'L': [[(80, 700), (80, 0), (480, 0)]],
  'M': [[(80, 0), (80, 700), (280, 400), (480, 700), (480, 0)]],
  'N': [[(80, 0), (80, 700), (480, 0), (480, 700)]],
  'O': [cercle(320, 350, 300)],
  'P': [[(80, 0), (80, 700), (400, 700), (480, 620), (480, 430), (400, 350), (80, 350)]],
  'Q': [cercle(320, 350, 300), [(400, 150), (580, -40)]],
  'R': [[(80, 0), (80, 700), (400, 700), (480, 620), (480, 430), (400, 350), (80, 350)], [(300, 350), (480, 0)]],
  'S': [[(480, 620), (400, 700), (160, 700), (80, 620), (80, 430), (160, 350), (400, 350), (480, 270), (480, 80), (400, 0), (160, 0), (80, 80)]],
  'T': [[(60, 700), (500, 700)], [(280, 700), (280, 0)]],
  'U': [[(80, 700), (80, 80), (160, 0), (400, 0), (480, 80), (480, 700)]],
  'V': [[(60, 700), (280, 0), (500, 700)]],
  'W': [[(40, 700), (150, 0), (280, 420), (410, 0), (520, 700)]],
  'X': [[(80, 0), (480, 700)], [(80, 700), (480, 0)]],
  'Y': [[(80, 700), (280, 380), (480, 700)], [(280, 380), (280, 0)]],
  'Z': [[(80, 700), (480, 700), (80, 0), (480, 0)]],
  '0': [[(80, 80), (160, 0), (400, 0), (480, 80), (480, 620), (400, 700), (160, 700), (80, 620), (80, 80)], [(150, 150), (410, 550)]],
  '1': [[(160, 560), (300, 700), (300, 0)], [(160, 0), (440, 0)]],
  '2': [[(80, 620), (160, 700), (400, 700), (480, 620), (480, 430), (80, 0), (480, 0)]],
  '3': [[(80, 700), (480, 700), (260, 400), (400, 400), (480, 320), (480, 80), (400, 0), (160, 0), (80, 80)]],
  '4': [[(400, 0), (400, 700), (60, 200), (500, 200)]],
  '5': [[(480, 700), (80, 700), (80, 400), (400, 400), (480, 320), (480, 80), (400, 0), (80, 0)]],
  '6': [[(440, 700), (160, 700), (80, 620), (80, 80), (160, 0), (400, 0), (480, 80), (480, 320), (400, 400), (80, 400)]],
  '7': [[(80, 700), (480, 700), (200, 0)]],
  '8': [[(160, 350), (80, 430), (80, 620), (160, 700), (400, 700), (480, 620), (480, 430), (400, 350), (160, 350), (80, 270), (80, 80), (160, 0), (400, 0), (480, 80), (480, 270), (400, 350)]],
  '9': [[(80, 0), (400, 0), (480, 80), (480, 620), (400, 700), (160, 700), (80, 620), (80, 380), (160, 300), (480, 300)]],
  '.': [[(140, 0), (140, 1)]], ',': [[(150, 40), (110, -90)]], ':': [[(140, 0), (140, 1)], [(140, 420), (140, 421)]], ';': [[(150, 40), (110, -90)], [(140, 420), (140, 421)]],
  '!': [[(140, 700), (140, 200)], [(140, 0), (140, 1)]], '?': [[(80, 620), (160, 700), (400, 700), (480, 620), (480, 450), (280, 300), (280, 200)], [(280, 0), (280, 1)]],
  '-': [[(100, 330), (400, 330)]], '_': [[(40, -40), (520, -40)]], '/': [[(60, -40), (440, 740)]], '\\': [[(60, 740), (440, -40)]],
  '(': [[(260, 760), (140, 640), (140, 60), (260, -60)]], ')': [[(100, 760), (220, 640), (220, 60), (100, -60)]],
  '[': [[(260, 760), (120, 760), (120, -60), (260, -60)]], ']': [[(100, 760), (240, 760), (240, -60), (100, -60)]],
  "'": [[(140, 700), (140, 520)]], '"': [[(100, 700), (100, 520)], [(240, 700), (240, 520)]], '’': [[(160, 700), (120, 540)]],
  '+': [[(80, 330), (480, 330)], [(280, 130), (280, 530)]], '=': [[(80, 430), (480, 430)], [(80, 230), (480, 230)]], '*': [[(280, 560), (280, 200)], [(130, 470), (430, 290)], [(130, 290), (430, 470)]],
  '#': [[(180, 0), (220, 700)], [(380, 0), (420, 700)], [(80, 470), (500, 470)], [(60, 230), (480, 230)]],
  '%': [cercle(150, 560, 80), cercle(410, 140, 80), [(80, 0), (480, 700)]], '&': [[(480, 0), (140, 480), (140, 620), (220, 700), (340, 700), (400, 620), (400, 520), (80, 260), (80, 80), (160, 0), (360, 0), (480, 160)]],
  '@': [cercle(320, 300, 280), cercle(320, 300, 110), [(430, 300), (430, 120), (560, 120)]],
  '<': [[(460, 600), (100, 330), (460, 60)]], '>': [[(100, 600), (460, 330), (100, 60)]], '«': [[(260, 560), (100, 330), (260, 100)], [(440, 560), (280, 330), (440, 100)]], '»': [[(100, 560), (260, 330), (100, 100)], [(280, 560), (440, 330), (280, 100)]],
  '·': [[(140, 330), (140, 331)]], '…': [[(120, 0), (120, 1)], [(320, 0), (320, 1)], [(520, 0), (520, 1)]], '—': [[(40, 330), (760, 330)]], '–': [[(60, 330), (500, 330)]],
  '|': [[(140, 760), (140, -60)]], '~': [[(80, 300), (180, 380), (380, 280), (480, 360)]], '°': [cercle(160, 600, 70)],
  # les glyphes du lexique, aux points de code des symboles qui les portent
  '◇': [[(280, 700), (520, 350), (280, 0), (40, 350), (280, 700)]], '△': [[(40, 0), (280, 700), (520, 0), (40, 0)]], '□': [[(60, 0), (60, 640), (500, 640), (500, 0), (60, 0)]],
  '○': [cercle(320, 330, 280)], '✕': [[(80, 60), (480, 640)], [(80, 640), (480, 60)]], '⧗': [[(80, 700), (480, 700), (80, 0), (480, 0), (80, 700)]],
}
CHASSE = {'O': 640, 'Q': 660, 'W': 560, 'I': 300, '.': 280, ',': 280, ':': 280, ';': 280, '!': 280, "'": 280, '’': 280, '"': 340, '(': 340, ')': 340, '[': 340, ']': 340,
          '|': 280, '·': 280, '°': 320, '-': 500, '%': 560, '@': 680, '—': 800, '…': 640, '○': 640}
# les accents (au-dessus de la capitale : 700 → 900)
ACCENTS = {'aigu': [[(230, 780), (330, 890)]], 'grave': [[(230, 890), (330, 780)]], 'circ': [[(180, 780), (280, 880), (380, 780)]],
           'trema': [[(190, 820), (190, 821)], [(370, 820), (370, 821)]], 'cedille': [[(280, 0), (280, -60), (220, -140)]], 'rond': [cercle(280, 840, 55)]}
COMPOSES = {'É': ('E', 'aigu'), 'È': ('E', 'grave'), 'Ê': ('E', 'circ'), 'Ë': ('E', 'trema'), 'À': ('A', 'grave'), 'Â': ('A', 'circ'), 'Ä': ('A', 'trema'), 'Å': ('A', 'rond'),
            'Î': ('I', 'circ'), 'Ï': ('I', 'trema'), 'Ô': ('O', 'circ'), 'Ö': ('O', 'trema'), 'Ù': ('U', 'grave'), 'Û': ('U', 'circ'), 'Ü': ('U', 'trema'), 'Ç': ('C', 'cedille'),
            'Ÿ': ('Y', 'trema'), 'Ñ': ('N', 'circ'), 'Á': ('A', 'aigu'), 'Í': ('I', 'aigu'), 'Ó': ('O', 'aigu'), 'Ú': ('U', 'aigu')}

def ruban(a, b, e):
    (x0, y0), (x1, y1) = a, b
    dx, dy = x1 - x0, y1 - y0; l = math.hypot(dx, dy) or 1
    nx, ny = -dy / l * e / 2, dx / l * e / 2
    return [(x0 + nx, y0 + ny), (x1 + nx, y1 + ny), (x1 - nx, y1 - ny), (x0 - nx, y0 - ny)]
def rond(cx, cy, r, n=20): return [(cx + r * math.cos(2 * math.pi * i / n), cy + r * math.sin(2 * math.pi * i / n)) for i in range(n)]
def anneau(cx, cy, r, e, n=72):
    pts = [(cx + r * math.cos(2 * math.pi * i / n), cy + r * math.sin(2 * math.pi * i / n)) for i in range(n + 1)]
    return [ruban(pts[i], pts[i + 1], e) for i in range(n)] + [rond(x, y, e / 2, 10) for x, y in pts[:-1]]

def contours(traits, e, dx=0):
    polys = []
    for t in traits:
        if isinstance(t, tuple) and t[0] == C:
            polys += anneau(t[1] + dx, t[2], t[3], e)
            continue
        pts = [(x + dx, y) for x, y in t]
        for i in range(len(pts) - 1): polys.append(ruban(pts[i], pts[i + 1], e))
        for x, y in pts: polys.append(rond(x, y, e / 2))
    chemin = pathops.Path()
    for p in polys:
        q = pathops.Path(); q.moveTo(*p[0])
        for x, y in p[1:]: q.lineTo(x, y)
        q.close()
        chemin = pathops.op(chemin, q, pathops.PathOp.UNION)
    return chemin

def glyphe(chemin):
    stylo = TTGlyphPen(None)
    chemin.draw(stylo)
    return stylo.glyph()

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('sortie'); ap.add_argument('--graisse', type=int, default=70); ap.add_argument('--nom', default='ChillTekk')
    a = ap.parse_args(); e = a.graisse
    noms, glyphes, avances, cmap = ['.notdef', 'space'], {}, {}, {32: 'space', 160: 'space'}
    glyphes['.notdef'] = glyphe(contours([[(60, 0), (60, 700), (500, 700), (500, 0), (60, 0)]], e)); avances['.notdef'] = (560, 0)
    vide = TTGlyphPen(None); glyphes['space'] = vide.glyph(); avances['space'] = (300, 0)
    def ajouter(car, traits, chasse):
        n = 'u%04X' % ord(car); noms.append(n); glyphes[n] = glyphe(contours(traits, e, dx=40)); avances[n] = (chasse + 80, 40)
        cmap[ord(car)] = n
        if car.isalpha() and car.lower() != car: cmap[ord(car.lower())] = n   # unicase
    for car, traits in L.items(): ajouter(car, traits, CHASSE.get(car, 560))
    for car, (base, acc) in COMPOSES.items():
        dec = (CHASSE.get(base, 560) - 560) // 2
        ajouter(car, L[base] + [[(x + dec, y) for x, y in t] if not (isinstance(t, tuple) and t[0] == C) else (C, t[1] + dec, t[2], t[3]) for t in ACCENTS[acc]], CHASSE.get(base, 560))
    cmap[ord('ß')] = cmap[ord('S')]; cmap[ord('œ')] = cmap[ord('O')]; cmap[ord('Œ')] = cmap[ord('O')]
    fb = FontBuilder(1000, isTTF=True)
    fb.setupGlyphOrder(noms); fb.setupCharacterMap(cmap); fb.setupGlyf(glyphes); fb.setupHorizontalMetrics(avances)
    fb.setupHorizontalHeader(ascent=900, descent=-200)
    fb.setupNameTable({'familyName': a.nom, 'styleName': 'Regular', 'uniqueFontIdentifier': a.nom + '-xerboxion', 'fullName': a.nom, 'psName': a.nom + '-Regular', 'version': 'Version 0.96',
                       'copyright': 'XERB0XI0N — la police chill-tekk (libre, à forker)'})
    fb.setupOS2(sTypoAscender=900, sTypoDescender=-200, usWinAscent=950, usWinDescent=250, sxHeight=700, sCapHeight=700)
    fb.setupPost(); fb.setupHead(unitsPerEm=1000)
    import os
    os.makedirs(a.sortie, exist_ok=True)
    base = os.path.join(a.sortie, a.nom.lower())
    fb.save(base + '.ttf')
    fb.font.flavor = 'woff2'; fb.save(base + '.woff2')
    print('ok', base, len(cmap), 'caractères')

if __name__ == '__main__': main()
