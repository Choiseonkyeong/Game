"""Build Pogeun sky-island stage art from the reference sheets.

Sheet 1 (white background) supplies island terrain/house shapes; sheet 3 supplies
roof colour. Pixels that are brown roof in sheet 1 and pink roof in the aligned
sheet 3 are recoloured with sheet 3's roof palette, preserving sheet 1 shading.
Writes dist/island/art/world/sky-stage-N.webp and terrain.json.
"""
import json, sys
from collections import deque
from pathlib import Path
import numpy as np
from PIL import Image

SRC = Path(sys.argv[1])          # folder holding 1.webp, 3.webp
OUT = Path(sys.argv[2])          # dist/island/art/world
# Bounding boxes of the growth stages in sheet 1 that also appear in sheet 3.
STAGES = [(356, 28, 668, 228), (12, 276, 332, 492), (348, 256, 672, 540),
          (684, 248, 1008, 540), (8, 540, 508, 952), (540, 564, 1016, 1020)]
SCALES = [2.5, 2.4, 2.2, 2.1, 1.9, 1.85]   # world units per sheet pixel; small islands drawn larger
CENTER = (480, 430)
# Tap area of the main house per stage, in world units (x, y, width, height).
HOUSES = [(130, 180, 260, 250), (130, 170, 290, 290), (280, 120, 290, 350),
          (290, 120, 280, 350), (60, 40, 460, 380), (360, 20, 310, 360)]
GRID = {'hx': 21, 'hy': 10, 'ox': 480, 'oy': 210}   # half-size tiles on sky islands
CELL = lambda c, r: (GRID['ox'] + (c - r) * GRID['hx'], GRID['oy'] + (c + r) * GRID['hy'])


def background(crop):
    """Flood-fill near-white pixels from the crop border."""
    h, w, _ = crop.shape
    white = crop.min(2) > 232
    bg = np.zeros((h, w), bool)
    q = deque((y, x) for y in range(h) for x in (0, w - 1)) + deque((y, x) for x in range(w) for y in (0, h - 1))
    while q:
        y, x = q.popleft()
        if 0 <= y < h and 0 <= x < w and white[y, x] and not bg[y, x]:
            bg[y, x] = True
            q.extend(((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)))
    return bg


def largest(mask):
    """Keep the largest 8-connected component (drops neighbouring stages)."""
    h, w = mask.shape
    seen = np.zeros_like(mask)
    best = []
    for y in range(h):
        for x in range(w):
            if mask[y, x] and not seen[y, x]:
                q, pts = deque([(y, x)]), []
                seen[y, x] = True
                while q:
                    a, b = q.popleft()
                    pts.append((a, b))
                    for da in (-1, 0, 1):
                        for db in (-1, 0, 1):
                            c, d = a + da, b + db
                            if 0 <= c < h and 0 <= d < w and mask[c, d] and not seen[c, d]:
                                seen[c, d] = True
                                q.append((c, d))
                if len(pts) > len(best):
                    best = pts
    out = np.zeros_like(mask)
    for a, b in best:
        out[a, b] = True
    return out


def align(crop, mask, sheet, box):
    """Offset of crop inside sheet (coarse-to-fine gradient matching)."""
    g = lambda a: np.abs(np.diff(a.mean(2), axis=1, prepend=0)) + np.abs(np.diff(a.mean(2), axis=0, prepend=0))
    gc, gs = g(crop), g(sheet)
    x0, y0 = box[0], box[1]
    h, w = mask.shape

    def score(dx, dy, step):
        ys, xs = y0 + dy, x0 + dx
        if ys < 0 or xs < 0 or ys + h > sheet.shape[0] or xs + w > sheet.shape[1]:
            return 1e18
        a = gc[::step, ::step][mask[::step, ::step]]
        b = gs[ys:ys + h:step, xs:xs + w:step][mask[::step, ::step]]
        return np.abs(a - b).mean()

    best = min(((score(dx, dy, 4), dx, dy) for dx in range(-80, 81, 4) for dy in range(-80, 81, 4)))
    best = min(((score(best[1] + dx, best[2] + dy, 1), best[1] + dx, best[2] + dy) for dx in range(-4, 5) for dy in range(-4, 5)))
    return best[1], best[2]


def recolour(crop, mask, ref):
    r, g, b = (crop[..., i].astype(int) for i in range(3))
    R, G, B = (ref[..., i].astype(int) for i in range(3))
    brown = (r > g) & (g >= b - 4) & (r - b > 30) & (r < 215)
    gray = (abs(r - g) < 16) & (abs(g - b) < 16) & (r < 200)
    pink = (R - G > 22) & (B - G > -14) & (R > 150)
    roof = mask & (brown | gray) & pink
    # 3x3 majority smoothing removes speckles from imperfect alignment.
    pad = np.pad(roof, 1)
    votes = sum(pad[1 + dy:pad.shape[0] - 1 + dy, 1 + dx:pad.shape[1] - 1 + dx] for dy in (-1, 0, 1) for dx in (-1, 0, 1))
    roof = components(mask & (brown | gray) & (votes >= 5), 150)
    roof = fill_patches(roof, mask & (brown | gray))
    lum = crop.astype(float).mean(2)
    refl = ref.astype(float).mean(2)
    sample = mask & pink
    bins = np.linspace(refl[sample].min(), refl[sample].max(), 9)
    palette = []
    for lo, hi in zip(bins[:-1], bins[1:]):
        sel = sample & (refl >= lo) & (refl <= hi)
        palette.append(ref[sel].mean(0) if sel.any() else ref[sample].mean(0))
    palette = np.array(palette)
    lo, hi = np.percentile(lum[roof], [3, 97]) if roof.any() else (0, 255)
    idx = np.clip(((lum - lo) / max(1, hi - lo) * 8).astype(int), 0, 7)
    out = crop.copy()
    out[roof] = palette[idx[roof]].astype(np.uint8)
    return out, int(roof.sum())


def components(mask, minimum, conn8=True):
    """Connected components (list of point lists) or, with minimum, a mask of the large ones."""
    h, w = mask.shape
    seen = np.zeros_like(mask)
    out = np.zeros_like(mask)
    steps = [(a, b) for a in (-1, 0, 1) for b in (-1, 0, 1) if (a or b) and (conn8 or not (a and b))]
    for y, x in zip(*np.nonzero(mask)):
        if seen[y, x]:
            continue
        q, pts = deque([(y, x)]), []
        seen[y, x] = True
        while q:
            a, b = q.popleft()
            pts.append((a, b))
            for da, db in steps:
                c, d = a + da, b + db
                if 0 <= c < h and 0 <= d < w and mask[c, d] and not seen[c, d]:
                    seen[c, d] = True
                    q.append((c, d))
        if len(pts) >= minimum:
            for a, b in pts:
                out[a, b] = True
    return out


def fill_patches(roof, candidate):
    """Recolour small unpainted patches enclosed by roof (dormers the reference left brown)."""
    h, w = roof.shape
    rest = candidate & ~roof
    seen = np.zeros_like(rest)
    out = roof.copy()
    for y, x in zip(*np.nonzero(rest)):
        if seen[y, x]:
            continue
        q, pts, edge, near = deque([(y, x)]), [], 0, 0
        seen[y, x] = True
        while q:
            a, b = q.popleft()
            pts.append((a, b))
            for c, d in ((a + 1, b), (a - 1, b), (a, b + 1), (a, b - 1)):
                if not (0 <= c < h and 0 <= d < w):
                    continue
                if rest[c, d]:
                    if not seen[c, d]:
                        seen[c, d] = True
                        q.append((c, d))
                else:
                    edge += 1
                    near += roof[c, d]
        if len(pts) < 1500 and edge and near / edge > .6:
            for a, b in pts:
                out[a, b] = True
    return out


def grass(px):
    r, g, b = (px[..., i].astype(int) for i in range(3))
    green = (g > r + 8) & (g > b + 8)
    stone = (abs(r - g) < 18) & (abs(g - b) < 22) & (r > 150)
    return green, stone


def cells_for(img, alpha, ox, oy, SCALE):
    """Walkable cells: grass under the tile, nothing drawn in front of it."""
    green, stone = grass(img)
    walk = (green | stone) & alpha
    h, w = alpha.shape
    # Lowest grass row per column marks the front edge of the island top.
    front = np.full(w, -1)
    for x in range(w):
        ys = np.nonzero(green[:, x] & alpha[:, x])[0]
        if len(ys):
            front[x] = ys.max()
    to_px = lambda X, Y: (int(round((X - ox) / SCALE)), int(round((Y - oy) / SCALE)))
    out = []
    for c in range(-30, 50):
        for r in range(-30, 50):
            X, Y = CELL(c, r)
            hits = 0
            for fx, fy in ((0, 0), (-12, 0), (12, 0), (0, -5), (0, 5), (-6, -3), (6, 3), (6, -3), (-6, 3)):
                x, y = to_px(X + fx, Y + fy)
                hits += 0 <= x < w and 0 <= y < h and walk[y, x]
            x, y = to_px(X, Y)
            if hits < 7 or not (0 <= x < w and 0 <= y < h and alpha[y, x]) or front[x] < y:
                continue
            ok = True
            # Anything non-walkable between the tile and the island front would be
            # painted over a person standing here.
            for fx in (-7, 0, 7):
                x, y = to_px(X + fx, Y)
                end = front[x]
                band = ~walk[y + 2:end + 1, x] & alpha[y + 2:end + 1, x]
                run = best = 0
                for v in band:
                    run = run + 1 if v else 0
                    best = max(best, run)
                if best >= 28:
                    ok = False
                    break
            if ok:
                out.append([c, r])
    return connected(out)


def connected(cells):
    """Largest 4-connected group, so every walkable tile is reachable."""
    left, best = {tuple(c) for c in cells}, []
    while left:
        start = left.pop()
        group, q = [start], deque([start])
        while q:
            c, r = q.popleft()
            for n in ((c + 1, r), (c - 1, r), (c, r + 1), (c, r - 1)):
                if n in left:
                    left.remove(n)
                    group.append(n)
                    q.append(n)
        if len(group) > len(best):
            best = group
    return sorted([list(c) for c in best])


def main():
    s1 = np.array(Image.open(SRC / '1.webp').convert('RGB'))
    s3 = np.array(Image.open(SRC / '3.webp').convert('RGB'))
    stages = []
    for i, box in enumerate(STAGES, 1):
        crop = s1[box[1]:box[3], box[0]:box[2]]
        mask = largest(~background(crop))
        dx, dy = align(crop, mask, s3, box)
        ref = s3[box[1] + dy:box[3] + dy, box[0] + dx:box[2] + dx]
        art, roof = recolour(crop, mask, ref)
        rgba = np.dstack([art, np.where(mask, 255, 0).astype(np.uint8)])
        Image.fromarray(rgba, 'RGBA').save(OUT / f'sky-stage-{i}.webp', lossless=True)
        h, w = mask.shape
        SCALE = SCALES[i - 1]
        W, H = w * SCALE, h * SCALE
        ox, oy = CENTER[0] - W / 2, CENTER[1] - H / 2
        cells = cells_for(art, mask, ox, oy, SCALE)
        stages.append({'level': i, 'file': f'art/world/sky-stage-{i}.webp', 'x': round(ox, 1), 'y': round(oy, 1),
                       'width': round(W, 1), 'height': round(H, 1), 'scale': SCALE, 'house': list(HOUSES[i - 1]), 'cells': cells})
        print(f'stage {i}: offset {dx},{dy} roof px {roof} cells {len(cells)}')
    (OUT / 'sky-terrain.json').write_text(json.dumps({'version': 1, 'grid': GRID, 'stages': stages}, separators=(',', ':')))


if __name__ == '__main__':
    main()
