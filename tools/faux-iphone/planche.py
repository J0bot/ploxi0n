# La planche contact d'une galerie du faux iPhone : python3 -I tools/faux-iphone/planche.py <dossier> <sortie.png> [colonnes]
import sys, glob, os
from PIL import Image, ImageDraw, ImageFont
dossier, sortie = sys.argv[1], sys.argv[2]; col = int(sys.argv[3]) if len(sys.argv) > 3 else 5
fichiers = sorted(glob.glob(os.path.join(dossier, 'g-*.png')), key=lambda f: (int(os.path.basename(f).split('-')[1]), f))
L = 300; imgs = []
for f in fichiers:
    im = Image.open(f).convert('RGB'); h = int(im.height * L / im.width); imgs.append((os.path.basename(f)[:-4].split('-', 2)[-1], im.resize((L, h), Image.LANCZOS)))
H = max(i.height for _, i in imgs); marge, legende = 14, 26
lig = (len(imgs) + col - 1) // col
planche = Image.new('RGB', (col * (L + marge) + marge, lig * (H + legende + marge) + marge), (7, 5, 12))
d = ImageDraw.Draw(planche)
try: police = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf', 15)
except Exception: police = ImageFont.load_default()
for k, (nom, im) in enumerate(imgs):
    x = marge + (k % col) * (L + marge); y = marge + (k // col) * (H + legende + marge)
    d.text((x + 2, y + 4), nom, fill=(200, 190, 230), font=police); planche.paste(im, (x, y + legende))
planche.save(sortie, optimize=True); print(sortie, planche.size, len(imgs), 'images')
