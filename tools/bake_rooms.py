"""Bake taller room plates and painted paper clues for the focused chapters.

The rooms are extended above (ceiling) and below (floor) so a portrait phone is filled with
scene instead of blurred bands. Country details are painted into the plate with the same
grain and light as the artwork. Run from the repository root:  python3 tools/bake_rooms.py
"""
import math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops

ART = 'dist/travel-art/'
TOP, BOTTOM = 176, 160          # added rows above and below the original 1536×1024 room
JP = '/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf'
KR = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
rng = np.random.default_rng(7)

def font(path, size): return ImageFont.truetype(path, size)

def grain(img, amount=7, blur=.6):
    """Painterly finish: soften edges a touch and add the plate's film grain."""
    a = np.asarray(img).astype(np.float32)
    n = rng.normal(0, amount, a.shape[:2])[..., None]
    a[..., :3] = np.clip(a[..., :3] + n, 0, 255)
    out = Image.fromarray(a.astype(np.uint8), img.mode)
    return out.filter(ImageFilter.GaussianBlur(blur)) if blur else out

def shade(layer, top=1.0, bottom=.82, warm=(255, 236, 205)):
    """Vertical light falloff and a warm cast, matching the sunlit plates."""
    w, h = layer.size
    g = np.linspace(top, bottom, h, dtype=np.float32)[:, None, None]
    a = np.asarray(layer).astype(np.float32)
    tint = np.array(warm, np.float32) / 255
    a[..., :3] = np.clip(a[..., :3] * g * tint, 0, 255)
    return Image.fromarray(a.astype(np.uint8), layer.mode)

def soft_shadow(base, layer, offset=(4, 8), blur=8, alpha=.35):
    sh = Image.new('RGBA', layer.size, (40, 28, 18, 0))
    sh.putalpha(layer.getchannel('A').point(lambda v: int(v * alpha)))
    sh = sh.filter(ImageFilter.GaussianBlur(blur))
    base.alpha_composite(sh, offset)

def place(base, layer, xy=(0, 0), shadow=True, **kw):
    layer = grain(layer)
    if shadow: soft_shadow(base, layer.copy(), (xy[0] + kw.get('dx', 4), xy[1] + kw.get('dy', 8)), kw.get('blur', 8), kw.get('alpha', .32))
    base.alpha_composite(layer, xy)

def vertical_text(draw, x, y, text, f, fill, gap=2):
    for ch in text:
        bb = f.getbbox(ch); w = bb[2] - bb[0]
        draw.text((x - w / 2 - bb[0], y), ch, font=f, fill=fill)
        y += f.size + gap

def extend_floor(src, x0, x1):
    """Continue the floor toward the viewer: the nearest rows stretch down, defocus and darken like a close foreground."""
    band = src.crop((x0, 1024 - 10, x1, 1024)).convert('RGB').resize((x1 - x0, BOTTOM), Image.BILINEAR)
    steps = [band.filter(ImageFilter.GaussianBlur(r)) for r in (10, 16, 22, 30, 40)]
    out = np.zeros((BOTTOM, x1 - x0, 3), np.float32)
    t = np.linspace(0, 1, BOTTOM)
    for y in range(BOTTOM):
        k = t[y] * (len(steps) - 1); i = int(k); f = k - i; j = min(i + 1, len(steps) - 1)
        row = (1 - f) * np.asarray(steps[i])[y].astype(np.float32) + f * np.asarray(steps[j])[y].astype(np.float32)
        out[y] = row * (0.97 - 0.2 * t[y])
    out += rng.normal(0, 3, out.shape[:2])[..., None]
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).convert('RGBA')

def soften_seam(plate, y, depth=120, blur=10):
    """Begin the foreground defocus inside the original art so no hard line remains at the join."""
    W = plate.size[0]; zone = plate.crop((0, y - depth, W, y + 40)).convert('RGB')
    soft = zone.filter(ImageFilter.GaussianBlur(blur)); a = np.asarray(zone).astype(np.float32); b = np.asarray(soft).astype(np.float32)
    w = np.clip((np.arange(depth + 40) - depth * .2) / (depth * .8), 0, 1)[:, None, None]
    dark = (1 - .03 * w)
    plate.paste(Image.fromarray(np.clip((a * (1 - w) + b * w) * dark, 0, 255).astype(np.uint8)).convert('RGBA'), (0, y - depth))

def extend_wall(src, x0, x1, rows=6):
    """Continue the wall upward from its top rows with a soft ceiling falloff."""
    band = src.crop((x0, 0, x1, rows)).resize((x1 - x0, TOP), Image.BILINEAR).filter(ImageFilter.GaussianBlur(3))
    a = np.asarray(band.convert('RGB')).astype(np.float32)
    fall = np.linspace(.74, 1.0, TOP, dtype=np.float32)[:, None, None]
    return Image.fromarray(np.clip(a * fall, 0, 255).astype(np.uint8)).convert('RGBA')

def ceiling(plate, x0, x1, y1, color=(214, 200, 172)):
    """Plaster ceiling with a wooden crown moulding along the wall."""
    d = ImageDraw.Draw(plate)
    for y in range(0, y1):
        k = .78 + .2 * y / y1
        d.line([(x0, y), (x1, y)], fill=tuple(int(c * k) for c in color) + (255,))
    d.rectangle([x0, y1, x1, y1 + 10], fill=(150, 108, 66, 255))
    d.rectangle([x0, y1 + 10, x1, y1 + 13], fill=(112, 78, 46, 255))


# ---------------------------------------------------------------- separate layers
LAYERS = {}          # room -> {id: (RGBA sprite, x, y in plate coordinates)}

def harmonic_fill(region, mask, iters=160):
    """Fill masked pixels smoothly from their surroundings (plaster, floor) by diffusion, coarse to fine so large holes converge."""
    a = region.astype(np.float32).copy(); m = mask.astype(bool)
    border = (np.asarray(Image.fromarray(m.astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(9))) > 0) & ~m
    a[m] = np.median(a[border] if border.any() else a[~m], axis=0)
    if min(a.shape[:2]) > 24:                        # solve a half-size problem first and use it as the starting point
        h, w = a.shape[:2]; small = harmonic_fill(np.asarray(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).resize((w // 2, h // 2), Image.BILINEAR)).astype(np.float32),
                                                   np.asarray(Image.fromarray(m.astype(np.uint8) * 255).resize((w // 2, h // 2))) > 127, iters)
        up = np.asarray(Image.fromarray(np.clip(small, 0, 255).astype(np.uint8)).resize((w, h), Image.BILINEAR)).astype(np.float32); a[m] = up[m]
    for _ in range(iters):
        avg = (np.roll(a, 1, 0) + np.roll(a, -1, 0) + np.roll(a, 1, 1) + np.roll(a, -1, 1)) / 4
        a[m] = avg[m]
    return a

def column_fill(region, mask):
    """Fill masked pixels column by column between the nearest clear pixels above and below (vertical wood grain)."""
    a = region.astype(np.float32).copy(); h = a.shape[0]
    for x in range(a.shape[1]):
        col = mask[:, x]
        if not col.any(): continue
        ys = np.where(~col)[0]
        if len(ys) == 0: continue
        for y in np.where(col)[0]:
            up = ys[ys < y]; dn = ys[ys > y]
            if len(up) and len(dn):
                t = (y - up[-1]) / (dn[0] - up[-1]); a[y, x] = a[up[-1], x] * (1 - t) + a[dn[0], x] * t
            else: a[y, x] = a[(up[-1] if len(up) else dn[0]), x]
    return a

def lift_object(plate, room, oid, polys, mode='plaster', keep_above=None, threshold=(24, 56), erode=9, robust=True, sd_max=16, zt=2.6, fill_holes=True, cloth=False):
    """Cut an object out of the painted plate as its own layer and repaint the background behind it.
    polys (plate coordinates) trace the object; thin parts such as straps get their own polygon so the gaps between them stay
    background. The inside of each polygon is solid; only a thin edge band is decided by difference from the repainted background."""
    pts = [p for poly in polys for p in poly]; xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    x0, y0, x1, y1 = int(min(xs)) - 10, int(min(ys)) - 10, int(max(xs)) + 10, int(max(ys)) + 10
    region = np.asarray(plate.crop((x0, y0, x1, y1)).convert('RGB')).astype(np.float32)
    shape = Image.new('L', (x1 - x0, y1 - y0)); d = ImageDraw.Draw(shape)
    for poly in polys: d.polygon([(x - x0, y - y0) for x, y in poly], fill=255)
    if keep_above is not None: d.rectangle([0, 0, x1 - x0, keep_above - y0], fill=0)
    mimg = shape.filter(ImageFilter.MaxFilter(9)); mask = np.asarray(mimg) > 0
    clean = harmonic_fill(region, mask)
    if mode == 'wood':                                  # vertical grain: per-column streaks plus fine noise
        grainc = rng.normal(0, 7, (1, region.shape[1], 1))
        streak = np.asarray(Image.fromarray(rng.normal(128, 50, (region.shape[0] // 8 + 1, region.shape[1])).clip(0, 255).astype(np.uint8)).resize((region.shape[1], region.shape[0]), Image.BICUBIC)).astype(np.float32)[..., None]
        clean = np.where(mask[..., None], clean * (1 + (streak - 128) / 900) + grainc, clean)
    clean[mask] += rng.normal(0, 3.2, (mask.sum(), 1)); clean = np.clip(clean, 0, 255)
    diff = np.abs(region - clean).sum(axis=2); lo, hi = threshold
    # Object = clearly different from the repainted background, inside the traced area; close small gaps and fill holes.
    # Background colour statistics from a ring just outside the traced area; far-from-background pixels are the object.
    ring = (np.asarray(shape.filter(ImageFilter.MaxFilter(41))) > 0) & ~(np.asarray(shape.filter(ImageFilter.MaxFilter(13))) > 0)
    bgpx = region[ring]
    if robust: med = np.median(bgpx, axis=0); bgpx = bgpx[np.abs(bgpx - med).sum(axis=1) < 60]   # dominant wall/wood colour only
    mu = bgpx.mean(axis=0); sd = np.clip(bgpx.std(axis=0), 7, sd_max)
    z = np.sqrt((((region - mu) / sd) ** 2).sum(axis=2) / 3)
    core = np.asarray(shape.filter(ImageFilter.MinFilter(erode))) > 0 if erode else np.zeros_like(mask)
    if cloth:                                  # olive cloth on pale plaster: darker than the repainted wall and not orange like wood
        lum_o = region.mean(axis=2); lum_c = clean.mean(axis=2); warm = (region[..., 0] - region[..., 2]) / np.maximum(region[..., 0], 1)
        z = np.where((lum_c - lum_o > 14) & (warm < .58), 9.0, 0.0); core = np.zeros_like(mask)
    obj = (((z > zt) & (diff > lo)) | core) & (np.asarray(shape.filter(ImageFilter.MaxFilter(5))) > 0)
    solid = Image.fromarray(obj.astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.MinFilter(7))
    if fill_holes:
        holes = solid.copy(); ImageDraw.floodfill(holes, (0, 0), 128)
        solid = Image.fromarray(np.where(np.asarray(holes) == 128, 0, 255).astype(np.uint8))
    solid = solid.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))              # drop specks
    near = np.asarray(solid.filter(ImageFilter.MaxFilter(5))) > 0
    edge = np.clip((diff - lo) / (hi - lo), 0, 1) * near
    alpha = np.maximum(np.asarray(solid).astype(np.float32) / 255 * .999, edge * .9)
    alpha = np.asarray(Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.7))).astype(np.float32) / 255
    sprite = np.dstack([region, alpha * 255]).astype(np.uint8)
    soft = np.asarray(mimg.filter(ImageFilter.GaussianBlur(2))).astype(np.float32)[..., None] / 255
    out = region * (1 - soft) + clean * soft
    plate.paste(Image.fromarray(out.astype(np.uint8)).convert('RGBA'), (x0, y0))
    LAYERS.setdefault(room, {})[oid] = (Image.fromarray(sprite, 'RGBA'), x0, y0)


def repaint_tote(plate, Y):
    """Remove the tote completely: rebuild the counter side panel from clean wood above and beside it,
    then repaint the tote as its own layer (canvas body with folds, two straps, the original city print)."""
    src = plate.copy()
    # 2) the tote layer keeps the original painted pixels. Canvas is far less orange than the wood, which separates the straps cleanly.
    lx, ly, lw, lh = 514, Y(486), 116, 272
    orig = np.asarray(src.crop((lx, ly, lx + lw, ly + lh)).convert('RGB')).astype(np.float32)
    shape = Image.new('L', (lw, lh)); d = ImageDraw.Draw(shape)
    P = lambda pts: [(x - lx, Y(y) - ly) for x, y in pts]
    d.polygon(P([(528, 586), (622, 586), (624, 600), (624, 748), (532, 752), (526, 600)]), fill=255)
    d.polygon(P([(541, 486), (558, 486), (546, 596), (528, 596)]), fill=255); d.polygon(P([(553, 486), (570, 486), (624, 596), (606, 596)]), fill=255)
    warm = (orig[..., 0] - orig[..., 2]) / np.maximum(orig[..., 0], 1)
    canvas = np.clip((.47 - warm) / .07, 0, 1)
    # Straps: wherever the pale canvas runs down from the hook, whatever polygon was guessed.
    strap = np.zeros((lh, lw), bool); strap[Y(500) - ly:Y(600) - ly, 520 - lx:] = canvas[Y(500) - ly:Y(600) - ly, 520 - lx:] > .5
    strap = np.asarray(Image.fromarray((strap * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))) > 0
    shape = Image.fromarray(np.maximum(np.asarray(shape), strap.astype(np.uint8) * 255))
    body = np.asarray(shape.filter(ImageFilter.MinFilter(11))).astype(np.float32) / 255
    hook = np.zeros((lh, lw)); hook[:Y(512) - ly] = 1                 # brass hooks stay in the plate
    alpha = np.maximum(canvas, body) * (np.asarray(shape).astype(np.float32) / 255) * (1 - hook * (canvas < .5))
    alpha = np.asarray(Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(3)).filter(ImageFilter.GaussianBlur(.5))).astype(np.float32)
    tote = Image.fromarray(np.dstack([orig, alpha]).astype(np.uint8), 'RGBA')
    # 1) repaint only where the bag was: wood from the same row of the bag-free panel to the left keeps the vertical grain;
    #    the few pixels past the panel edge (x>=617) and below its base are filled down their own column.
    m = (np.asarray(Image.fromarray(alpha.astype(np.uint8)).filter(ImageFilter.MaxFilter(7))) > 8) | (np.asarray(shape.filter(ImageFilter.MaxFilter(7))) > 0)
    m[:Y(500) - ly] &= np.asarray(shape.filter(ImageFilter.MaxFilter(5)))[:Y(500) - ly] > 0      # leave the hooks
    m[Y(590) - ly:Y(752) - ly, :530 - lx] = True                                             # the bag's painted shadow on the panel
    reg = orig.copy(); pool = np.asarray(src.crop((474, ly, 530, ly + lh)).convert('RGB')).astype(np.float32)
    lum = pool.mean(axis=(0, 2)); keep = np.abs(lum - np.median(lum)) < .08 * np.median(lum)     # drop grooves and shadow columns
    donor = pool[:, keep]; DW = donor.shape[1]
    med = np.median(donor, axis=1, keepdims=True); donor = med + np.clip(donor - med, -14, 14)   # keep grain, drop local shadows
    edge_x = 617 - lx; base_y = Y(744) - ly
    for y in range(lh):
        row = m[y]
        if not row.any(): continue
        clear = np.where(~row[:edge_x])[0]
        ref = reg[y, clear].mean(axis=0) if len(clear) else donor[y].mean(axis=0)
        for x in np.where(row)[0]:
            if x < edge_x and y < base_y:
                k = x % (2 * DW); dx = k if k < DW else 2 * DW - 1 - k
                reg[y, x] = donor[y, dx] - donor[y].mean(axis=0) + ref
    col = column_fill(reg, m & ((np.arange(lw)[None, :] >= edge_x) | (np.arange(lh)[:, None] >= base_y)))
    reg = np.clip(col + rng.normal(0, 2.5, col.shape[:2])[..., None] * m[..., None], 0, 255)
    soft = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5))).astype(np.float32)[..., None] / 255
    plate.paste(Image.fromarray((orig * (1 - soft) + reg * soft).astype(np.uint8)).convert('RGBA'), (lx, ly))
    LAYERS.setdefault('tokyo', {})['tote'] = (tote, lx, ly)
    return
    add_layer(plate, 'tokyo', 'tote', tote, (514 + 3, Y(490)), blur=7, dx=5, dy=6, alpha=.32)

def add_layer(plate, room, oid, img, xy, **kw):
    """A painted prop becomes its own layer; only its soft shadow is baked into the plate."""
    img = grain(img)
    soft_shadow(plate, img.copy(), (xy[0] + kw.get('dx', 4), xy[1] + kw.get('dy', 8)), kw.get('blur', 8), kw.get('alpha', .3))
    LAYERS.setdefault(room, {})[oid] = (img, xy[0], xy[1])

def write_layers(room, out):
    """Pack a room's layers into one sheet plus a manifest (positions in original room coordinates, y may be negative)."""
    import json
    items = LAYERS.get(room, {}); x = y = rowh = 0; W = 1024; placed = {}
    for oid, (im, px, py) in items.items():
        if x + im.width > W: x = 0; y += rowh + 2; rowh = 0
        placed[oid] = (x, y); x += im.width + 2; rowh = max(rowh, im.height)
    sheet = Image.new('RGBA', (W, y + rowh + 2))
    manifest = {}
    for oid, (im, px, py) in items.items():
        sx, sy = placed[oid]; sheet.alpha_composite(im, (sx, sy))
        manifest[oid] = {'sx': sx, 'sy': sy, 'w': im.width, 'h': im.height, 'x': px, 'y': py - TOP}
    sheet.save(ART + out + '.webp', lossless=True)
    json.dump(manifest, open(ART + out + '.json', 'w'))

# ---------------------------------------------------------------- Tokyo

def tokyo_tower(h):
    """Tokyo Tower: slim antenna, special observatory near the top, main observatory, then legs splaying to an arch.
    Drawn at 4x then reduced, lit from the left and hazed for distance."""
    S = 4; W = int(h * .36); img = Image.new('RGBA', (W * S, h * S)); d = ImageDraw.Draw(img); cx = W * S / 2
    O, Wt, D = (222, 96, 54, 255), (238, 234, 226, 255), (150, 62, 38, 255)
    def half(t):                                   # half width as a fraction of W
        if t < .14: return .012
        if t < .27: return .012 + (t - .14) / .13 * .035
        if t < .56: return .047 + (t - .27) / .29 * .07
        return .117 + ((t - .56) / .44) ** 1.6 * .38
    Y = lambda t: t * h * S; X = lambda t: half(t) * W * S
    steps = np.linspace(0, 1, 120)
    def white(t): return any(a <= t < b for a, b in ((.14, .17), (.35, .38), (.66, .69), (.86, .89)))
    for t0, t1 in zip(steps[:-1], steps[1:]):
        d.polygon([(cx - X(t0), Y(t0)), (cx + X(t0), Y(t0)), (cx + X(t1), Y(t1)), (cx - X(t1), Y(t1))], fill=Wt if white(t0) else O)
    d.polygon([(cx - X(.8) * .55, Y(1)), (cx, Y(.8)), (cx + X(.8) * .55, Y(1))], fill=(0, 0, 0, 0))   # arch between the legs
    for k in range(18):                             # cross bracing
        t0 = .17 + k * .046; t1 = t0 + .046
        if t1 > 1: break
        d.line([(cx - X(t0), Y(t0)), (cx + X(t1), Y(t1))], fill=D, width=max(1, S // 2)); d.line([(cx + X(t0), Y(t0)), (cx - X(t1), Y(t1))], fill=D, width=max(1, S // 2))
    for t, k in ((.27, 1.9), (.56, 1.5)):          # observatories
        w2 = X(t) * k; d.rectangle([cx - w2, Y(t) - .03 * h * S, cx + w2, Y(t) + .012 * h * S], fill=(226, 224, 216, 255)); d.rectangle([cx - w2, Y(t) - .012 * h * S, cx + w2, Y(t) - .002 * h * S], fill=(96, 110, 122, 255))
    img = img.resize((W, h), Image.LANCZOS)
    a = np.asarray(img).astype(np.float32); light = np.linspace(1.12, .78, W)[None, :, None]
    a[..., :3] = np.clip(a[..., :3] * light, 0, 255); a[..., :3] = a[..., :3] * .8 + np.array([214, 220, 226]) * .2
    return Image.fromarray(a.astype(np.uint8), 'RGBA')

def tokyo_street_view(plate, Y):
    """Replace the upper street view in the big shop window with sky, a distant skyline and Tokyo Tower; trees stay in front."""
    x0, x1, horizon = 1240, 1442, 178
    view = plate.crop((x0, Y(0), x1, Y(horizon))).convert('RGB'); a = np.asarray(view).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    tree = ((g > r * 1.04) & (g > b * 1.08) & (g > 80)).astype(np.float32)
    tree = np.asarray(Image.fromarray((tree * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32) / 255
    w, h = x1 - x0, horizon
    sky = np.zeros((h, w, 3), np.float32); t = np.linspace(0, 1, h)[:, None]
    for y in range(h): sky[y, :] = np.array([176, 202, 224]) * (1 - y / h) + np.array([228, 229, 222]) * (y / h)
    skyimg = Image.fromarray(sky.astype(np.uint8)).convert('RGBA'); sd = ImageDraw.Draw(skyimg)
    rnd = random.Random(11); x = 0
    while x < w:                                                    # hazy distant skyline
        bw = rnd.randint(10, 26); bh = rnd.randint(6, 26); tone = rnd.randint(200, 214); sd.rectangle([x, h - bh, x + bw, h], fill=(tone, tone + 4, tone + 8, 255)); x += bw + rnd.randint(0, 4)
    tower = tokyo_tower(236); tw = tower.size[0]
    haze = Image.new('RGBA', tower.size, (214, 220, 224, 70)); haze.putalpha(ImageChops.multiply(tower.getchannel('A'), Image.new('L', tower.size, 70)))
    skyimg.alpha_composite(tower, (64 - tw // 2, 4))
    for y0, sag in ((26, 10), (40, 12)):                            # Tokyo street power lines
        pts = [(xx, y0 + sag * (1 - ((xx - w / 2) / (w / 2)) ** 2)) for xx in range(0, w + 1, 4)]
        sd.line(pts, fill=(70, 72, 74, 200), width=1)
    sd.line([(0, h - 2), (w, h - 2)], fill=(132, 126, 118, 255), width=2)   # roof cornice of the near building
    s = np.asarray(skyimg.convert('RGB').filter(ImageFilter.GaussianBlur(.7))).astype(np.float32)
    out = s * (1 - tree[..., None]) + a * tree[..., None]
    plate.paste(Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).convert('RGBA'), (x0, Y(0)))
def bake_tokyo():
    src = Image.open(ART + 'tokyo.webp').convert('RGBA')
    W, H = 1536, 1024 + TOP + BOTTOM
    plate = Image.new('RGBA', (W, H)); plate.alpha_composite(src, (0, TOP))
    Y = lambda y: y + TOP                      # original → tall coordinates
    tokyo_street_view(plate, Y)
    # The tote on the counter hook and the coat on the wall hook become their own layers (hooks stay in the plate).
    T_ = lambda pts: [(x, Y(y)) for x, y in pts]
    repaint_tote(plate, Y)
    lift_object(plate, 'tokyo', 'jacket', [T_([(976, 116), (988, 116), (1012, 140), (1022, 200), (1030, 290), (1040, 360), (1042, 410), (1026, 430), (952, 432), (932, 410), (928, 330), (934, 250), (942, 180), (952, 140)])], 'plaster', keep_above=Y(124), erode=25, cloth=True)

    # Above: wall continues, a further bookcase row reaches the ceiling, the storefront gets a teal header.
    plate.alpha_composite(extend_wall(src, 0, 1536), (0, 0))
    wall = extend_wall(src, 330, 455).resize((150, TOP))      # the vine's top would smear; use plain wall beside it
    plate.alpha_composite(wall, (455, 0))
    ceiling(plate, 0, 1536, 54)
    row = src.crop((605, 405, 935, 525))          # books and postcard row, reused as the top row
    row = shade(row, .86, .96)
    plate.alpha_composite(row, (605, Y(0) - 120))
    d = ImageDraw.Draw(plate)
    d.rectangle([600, 64, 940, 78], fill=(160, 116, 68, 255)); d.rectangle([600, 64, 612, Y(0)], fill=(171, 125, 74, 255)); d.rectangle([928, 64, 940, Y(0)], fill=(150, 108, 64, 255))
    header = Image.new('RGBA', (420, 70), (40, 86, 84, 255)); hd = ImageDraw.Draw(header)
    hd.rectangle([0, 60, 420, 70], fill=(30, 66, 64, 255)); hd.line([(0, 6), (420, 6)], fill=(70, 120, 116, 255), width=2)
    plate.alpha_composite(shade(header, 1, .9), (1120, Y(0) - 70))
    sign = font(JP, 30)
    hd2 = ImageDraw.Draw(plate); hd2.text((1168, Y(0) - 58), 'ミナミ写真館', font=sign, fill=(236, 222, 188, 255))
    hd2.text((1170, Y(0) - 24), 'MINAMI PHOTO · 現像 / プリント', font=font(JP, 13), fill=(200, 214, 196, 255))
    for x in (200, 1495):                          # lamp cords now reach a ceiling rose
        d.line([(x, 60), (x, Y(2))], fill=(44, 46, 42, 255), width=3); d.ellipse([x - 14, 54, x + 14, 66], fill=(190, 176, 150, 255))

    # Red paper lantern (chōchin) between the bookcase and the coat hook.
    lan = Image.new('RGBA', (90, 170)); ld = ImageDraw.Draw(lan)
    ld.line([(45, 0), (45, 30)], fill=(40, 34, 30, 255), width=2)
    ld.rectangle([27, 30, 63, 40], fill=(26, 22, 20, 255)); ld.rectangle([27, 152, 63, 162], fill=(26, 22, 20, 255))
    body = Image.new('L', (90, 170)); ImageDraw.Draw(body).ellipse([6, 36, 84, 158], fill=255)
    red = Image.new('RGBA', (90, 170), (196, 52, 38, 255))
    a = np.asarray(red).astype(np.float32); xs = np.linspace(-1, 1, 90)[None, :]
    a[..., :3] *= (1 - .38 * xs ** 2)[..., None]; red = Image.fromarray(a.astype(np.uint8))
    red.putalpha(body); lan.alpha_composite(red)
    for yy in range(46, 152, 9): ld.arc([8, yy - 40, 82, yy + 40], 200, 340, fill=(140, 30, 22, 160), width=1)
    vertical_text(ld, 45, 62, '写真', font(JP, 30), (24, 18, 16, 235), 6)
    add_layer(plate, 'tokyo', 'lantern', lan, (1018, Y(-8)), blur=10, dy=14)

    # Noren over the shop door only (the big window beside it keeps its street view): indigo cotton, two panels, white crest.
    nw, nh = 108, 168
    nor = Image.new('RGBA', (nw, nh)); nd = ImageDraw.Draw(nor)
    for i in range(2):
        x0 = i * nw // 2 + (2 if i else 0); x1 = (i + 1) * nw // 2 - 2
        nd.rectangle([x0, 0, x1, nh], fill=(38, 54, 92, 250))
    a = np.asarray(nor).astype(np.float32)
    folds = (1 + .09 * np.sin(np.linspace(0, 10 * math.pi, nw)))[None, :, None]
    a[..., :3] = np.clip(a[..., :3] * folds, 0, 255); nor = Image.fromarray(a.astype(np.uint8))
    nd = ImageDraw.Draw(nor)
    nd.ellipse([nw / 2 - 30, 30, nw / 2 + 30, 90], outline=(238, 232, 214, 255), width=4)
    nd.text((nw / 2 - 20, 40), '写', font=font(JP, 40), fill=(240, 234, 216, 255))
    vertical_text(nd, nw / 2, 100, '写真', font(JP, 22), (226, 220, 200, 230), 2)
    nd.rectangle([0, 0, nw, 9], fill=(110, 78, 46, 255))
    add_layer(plate, 'tokyo', 'noren', nor, (1132, Y(-6)), blur=6, dy=10, alpha=.4)

    # Door glass decal and shelf price cards.
    dec = Image.new('RGBA', (70, 330)); dd = ImageDraw.Draw(dec)
    vertical_text(dd, 35, 0, 'フィルム現像', font(JP, 34), (250, 250, 244, 190), 8)
    plate.alpha_composite(dec, (1238, Y(210)))
    for x, y, t, c in [(640, 292, '新入荷', (196, 52, 38)), (760, 405, '¥1,200', (196, 52, 38)), (858, 292, 'フィルム', (40, 60, 96)), (645, 525, 'おすすめ', (196, 52, 38)), (790, 650, '中古カメラ', (40, 60, 96))]:
        card = Image.new('RGBA', (66, 24), (250, 246, 234, 255)); cd = ImageDraw.Draw(card)
        cd.rectangle([0, 0, 65, 23], outline=c + (255,), width=2); f = font(JP, 13); bb = f.getbbox(t)
        cd.text(((66 - bb[2]) / 2, 4), t, font=f, fill=c + (255,))
        place(plate, card.rotate(random.uniform(-3, 3), expand=True, resample=Image.BICUBIC), (x, Y(y) - 4), blur=2, dy=2, dx=1, alpha=.25)

    # Maneki-neko on the back counter, beside the vine.
    cat = Image.new('RGBA', (60, 78)); c = ImageDraw.Draw(cat)
    c.ellipse([8, 30, 52, 76], fill=(246, 242, 232, 255)); c.ellipse([12, 8, 48, 42], fill=(248, 244, 236, 255))
    c.polygon([(14, 16), (18, 2), (26, 12)], fill=(248, 244, 236, 255)); c.polygon([(46, 16), (42, 2), (34, 12)], fill=(248, 244, 236, 255))
    c.polygon([(17, 13), (19, 6), (23, 11)], fill=(232, 150, 140, 255)); c.polygon([(43, 13), (41, 6), (37, 11)], fill=(232, 150, 140, 255))
    c.ellipse([44, 4, 58, 26], fill=(248, 244, 236, 255)); c.line([(46, 26), (50, 36)], fill=(220, 214, 200, 255), width=6)
    c.arc([18, 22, 28, 30], 200, 340, fill=(40, 34, 30, 255), width=2); c.arc([32, 22, 42, 30], 200, 340, fill=(40, 34, 30, 255), width=2)
    c.rectangle([14, 40, 46, 45], fill=(200, 48, 36, 255)); c.ellipse([26, 42, 34, 50], fill=(232, 186, 70, 255))
    c.ellipse([20, 52, 40, 70], fill=(232, 186, 70, 255)); c.text((24, 54), '福', font=font(JP, 13), fill=(150, 40, 30, 255))
    add_layer(plate, 'tokyo', 'cat', shade(cat, 1, .86), (560, Y(300)), blur=4, dy=4)

    # Doormat inside the door, painted in floor perspective (narrower towards the door).
    mat = Image.new('RGBA', (420, 140), (52, 56, 62, 255)); md = ImageDraw.Draw(mat)
    md.rectangle([8, 8, 411, 131], outline=(124, 122, 112, 255), width=4)
    f = font(JP, 40); bb = f.getbbox('いらっしゃいませ'); md.text(((420 - bb[2]) / 2, 46), 'いらっしゃいませ', font=f, fill=(214, 206, 186, 255))
    mat = grain(mat, 12, 0)
    tw, th = 300, 92
    # QUAD maps output corners (ul, ll, lr, ur) back to source points; a wider bottom gives depth.
    persp = mat.transform((tw, th), Image.QUAD, (-60, 0, 0, 140, 420, 140, 480, 0), Image.BICUBIC)
    mask = Image.new('L', (tw, th)); ImageDraw.Draw(mask).polygon([(34, 0), (0, th), (tw, th), (tw - 34, 0)], fill=255)
    persp.putalpha(ImageChops.multiply(persp.getchannel('A'), mask))
    place(plate, shade(persp, .92, 1), (1050, Y(930)), blur=3, dy=3, alpha=.3)


    # Glass wind chime (fūrin) at the street window; its paper strip carries Yun's note.
    fur = Image.new('RGBA', (90, 260)); fd = ImageDraw.Draw(fur)
    fd.line([(45, 0), (45, 22)], fill=(60, 56, 50, 255), width=2)
    glass = Image.new('RGBA', (90, 260)); gd = ImageDraw.Draw(glass)
    gd.pieslice([14, 20, 76, 92], 180, 360, fill=(206, 230, 236, 150)); gd.rectangle([14, 55, 76, 64], fill=(206, 230, 236, 150))
    gd.arc([14, 20, 76, 92], 180, 360, fill=(250, 254, 255, 220), width=2); gd.arc([22, 28, 50, 60], 200, 260, fill=(255, 255, 255, 240), width=3)
    gd.ellipse([32, 40, 46, 50], fill=(222, 74, 50, 220)); gd.polygon([(46, 45), (54, 40), (54, 50)], fill=(222, 74, 50, 220))  # painted goldfish
    fur.alpha_composite(glass)
    fd.line([(45, 64), (45, 116)], fill=(70, 64, 56, 255), width=2); fd.rectangle([40, 70, 50, 78], fill=(190, 170, 120, 255))
    strip = Image.new('RGBA', (30, 132), (238, 228, 200, 255)); sd = ImageDraw.Draw(strip)
    vertical_text(sd, 15, 6, 'お預り証は鞄の外へ', font(JP, 12), (70, 54, 40, 255), 1)
    fur.alpha_composite(strip, (30, 116))
    add_layer(plate, 'tokyo', 'furin', fur, (1400, Y(-26)), blur=6, dy=10, alpha=.25)

    # A receipt dropped by the counter corner: the shop marked which frame came out sharp.
    rec = Image.new('RGBA', (120, 190), (246, 243, 234, 255)); rd = ImageDraw.Draw(rec)
    for i, (t, sz) in enumerate([('ミナミ写真館', 15), ('──────', 12), ('現像  1本   ¥800', 12), ('プリント 1枚 ¥400', 12), ('', 12), ('◎ 3コマ目 ピント良好', 12), ('', 12), ('合計     ¥1,200', 13)]):
        rd.text((8, 10 + i * 20), t, font=font(JP, sz), fill=(64, 58, 52, 255))
    rec = rec.rotate(-18, expand=True, resample=Image.BICUBIC)
    rec = rec.transform(rec.size, Image.AFFINE, (1, .18, -20, 0, 1.0, 0), Image.BICUBIC).resize((int(rec.size[0] * .62), int(rec.size[1] * .42)))
    place(plate, shade(rec, .98, .9), (512, Y(905)), blur=3, dy=3, alpha=.28)
    # Below: the floor continues toward the viewer, out of focus.
    plate.alpha_composite(extend_floor(src, 0, 1536), (0, Y(1024)))
    soften_seam(plate, Y(1024))
    plate = grain(plate.convert('RGB').convert('RGBA'), 3, 0)
    plate.convert('RGB').save(ART + 'tokyo-tall-v11.webp', quality=88)
    write_layers('tokyo', 'tokyo-layers-v11')


# ---------------------------------------------------------------- paper clues
def paper(w, h, base=(244, 236, 214)):
    a = np.ones((h, w, 4), np.float32); a[..., :3] = base
    fib = rng.normal(0, 5, (h, w)); a[..., :3] += fib[..., None]
    yy, xx = np.mgrid[0:h, 0:w]; edge = np.minimum.reduce([xx, yy, w - 1 - xx, h - 1 - yy]).astype(np.float32)
    a[..., :3] *= (0.9 + 0.1 * np.clip(edge / 10, 0, 1))[..., None]
    a[..., 3] = 255
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')

def bake_papers():
    sheet = Image.new('RGBA', (1024, 1024))
    # Claim ticket お預り証 No.27 (0,0,240,150)
    t = paper(232, 142); d = ImageDraw.Draw(t)
    d.rectangle([10, 10, 221, 131], outline=(190, 70, 52, 255), width=3)
    d.text((22, 18), 'お預り証', font=font(JP, 22), fill=(190, 70, 52, 255)); d.text((150, 22), 'No.', font=font(JP, 16), fill=(120, 96, 80, 255))
    d.text((134, 46), '27', font=font(JP, 62), fill=(178, 58, 42, 255)); d.text((22, 58), 'フィルム 1本', font=font(JP, 15), fill=(96, 84, 70, 255)); d.text((22, 84), '現像・プリント', font=font(JP, 15), fill=(96, 84, 70, 255))
    d.text((22, 108), 'ミナミ写真館', font=font(JP, 13), fill=(120, 106, 90, 255))
    sheet.alpha_composite(grain(t, 4, .5), (4, 4))
    # Envelopes 12, 27, 31 (each 292x376 at x=8/308/608, y=160)
    for i, n in enumerate((12, 27, 31)):
        e = paper(292, 376, (204, 168, 118)); d = ImageDraw.Draw(e)
        d.polygon([(0, 0), (146, 110), (292, 0)], fill=(186, 150, 102, 255)); d.line([(0, 0), (146, 110), (292, 0)], fill=(160, 126, 84, 255), width=2)
        d.rectangle([46, 168, 246, 330], fill=(246, 240, 224, 255)); d.rectangle([46, 168, 246, 330], outline=(160, 126, 84, 255), width=2)
        d.text((62, 180), 'お預り', font=font(JP, 26), fill=(110, 84, 60, 255)); d.text((62, 222), 'No.', font=font(JP, 22), fill=(110, 84, 60, 255))
        d.text((112, 206), str(n), font=font(JP, 88), fill=(150, 64, 46, 255) if n == 27 else (96, 80, 66, 255))
        d.text((62, 300), 'DPE · ミナミ', font=font(JP, 16), fill=(130, 110, 90, 255))
        sheet.alpha_composite(grain(e, 5, .5), (8 + i * 300, 160))
    # Film strip base 1000x272 (y=560): orange-brown film with sprocket holes; frames are painted over at runtime.
    f = Image.new('RGBA', (1000, 272), (122, 70, 34, 236)); d = ImageDraw.Draw(f)
    for x in range(10, 1000, 45):
        d.rounded_rectangle([x, 14, x + 22, 34], 4, fill=(0, 0, 0, 0)); d.rounded_rectangle([x, 238, x + 22, 258], 4, fill=(0, 0, 0, 0))
    d.text((20, 40), 'KODAK  200   27A', font=font(JP, 14), fill=(232, 170, 90, 210)); d.text((520, 216), '3A      4A', font=font(JP, 14), fill=(232, 170, 90, 210))
    sheet.alpha_composite(grain(f, 6, .4), (8, 560))
    # Print paper 300x236 at (8,860): white photo paper
    pr = paper(300, 236, (250, 248, 242)); sheet.alpha_composite(grain(pr, 3, .4), (8, 860))
    sheet.save(ART + 'tokyo-papers-v10.webp', lossless=False, quality=90)

# ---------------------------------------------------------------- Seoul
def bake_seoul(name, out):
    src = Image.open(ART + name).convert('RGBA')
    W, H = 1536, 1024 + TOP + BOTTOM
    plate = Image.new('RGBA', (W, H)); plate.alpha_composite(src, (0, TOP))
    # The coat becomes a layer; the room image used by the scene compositor is saved without it.
    lift_object(plate, 'seoul', 'jacket', [[(x, y + TOP) for x, y in [(905, 214), (922, 214), (945, 245), (962, 300), (972, 380), (986, 470), (978, 520), (958, 548), (870, 548), (850, 500), (846, 430), (854, 330), (872, 260), (890, 240)]]], 'plaster', keep_above=TOP + 216, erode=0, robust=False, sd_max=999, cloth=True)
    plate.crop((0, TOP, 1536, TOP + 1024)).convert('RGB').save(ART + 'seoul-base-v11.webp', quality=90)
    plate.alpha_composite(extend_wall(src, 0, 1536), (0, 0)); ceiling(plate, 0, 1536, 70)
    d = ImageDraw.Draw(plate)
    pel = Image.new('RGBA', (484, 34), (176, 138, 94, 255)); pdw = ImageDraw.Draw(pel)   # wooden pelmet over the roman shade
    pdw.line([(0, 3), (484, 3)], fill=(204, 168, 120, 255), width=3); pdw.line([(0, 31), (484, 31)], fill=(120, 88, 56, 255), width=3)
    place(plate, shade(pel, 1, .85), (390, TOP - 34), blur=6, dy=6, alpha=.3)
    # Hanji pendant lamp in the new ceiling space: mulberry paper over thin wooden ribs.
    lamp = Image.new('RGBA', (130, 150)); ld = ImageDraw.Draw(lamp)
    ld.line([(65, 0), (65, 36)], fill=(70, 60, 48, 255), width=2)
    shade_l = Image.new('L', (130, 150)); ImageDraw.Draw(shade_l).ellipse([10, 34, 120, 146], fill=255)
    paper_c = Image.new('RGBA', (130, 150), (246, 236, 210, 255)); a = np.asarray(paper_c).astype(np.float32)
    xs = np.linspace(-1, 1, 130)[None, :]; ys = np.linspace(-1, 1, 150)[:, None]
    a[..., :3] *= (1 - .22 * xs ** 2 - .1 * np.clip(ys, 0, 1))[..., None]; a[..., :3] += rng.normal(0, 6, (150, 130))[..., None]
    paper_c = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); paper_c.putalpha(shade_l); lamp.alpha_composite(paper_c)
    for x in (30, 48, 65, 82, 100): ld.line([(x, 38), (65 + (x - 65) * 1.15, 90), (x, 142)], fill=(170, 128, 84, 150), width=2)
    ld.ellipse([52, 30, 78, 40], fill=(150, 106, 64, 255)); ld.ellipse([46, 138, 84, 148], fill=(150, 106, 64, 255))
    glow = Image.new('RGBA', (130, 150)); ImageDraw.Draw(glow).ellipse([30, 60, 100, 130], fill=(255, 226, 160, 70)); lamp.alpha_composite(glow.filter(ImageFilter.GaussianBlur(14)))
    add_layer(plate, 'seoul', 'hanji', lamp, (650, 50), blur=10, dy=14, alpha=.2)
    plate.alpha_composite(extend_floor(src, 0, 1536), (0, TOP + 1024))
    soften_seam(plate, TOP + 1024)
    plate = grain(plate.convert('RGB').convert('RGBA'), 3, 0)
    plate.convert('RGB').save(ART + out, quality=88)
    write_layers('seoul', 'seoul-layers-v11')

if __name__ == '__main__':
    random.seed(3)
    bake_tokyo()
    bake_papers()
    bake_seoul('seoul.webp', 'seoul-tall-v11.webp')
    print('baked')
