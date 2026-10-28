// 스프라이트 시트 로더 · 애니메이터 · 캔버스 렌더링
const cache = new Map();
const registry = new Map();

/** data/sprites.json 의 sprites 객체 등록. 유닛 데이터는 { ref: '키' } 로 참조한다. */
export function registerSprites(manifest) {
  for (const [k, v] of Object.entries(manifest?.sprites ?? manifest ?? {})) if (!k.startsWith('$')) registry.set(k, v);
}
/** { ref } 를 실제 애니메이션 정의로 풀어낸다 (ref 위에 덮어쓴 값이 있으면 우선) */
export function resolveAnim(def) {
  if (!def?.ref) return def;
  const base = registry.get(def.ref);
  if (!base) throw new Error(`스프라이트 정의가 없습니다: ${def.ref}`);
  const { ref, ...over } = def;
  return { ...base, ...over };
}

/** 이미지 로드 실패 시 쓰는 대체 시트 (프레임 번호가 찍힌 실루엣) */
function placeholderSheet(fw, fh, rows, cols, color = '#ff3b3b') {
  const c = document.createElement('canvas');
  c.width = fw * cols; c.height = fh * rows;
  const g = c.getContext('2d');
  for (let r = 0; r < rows; r++) for (let f = 0; f < cols; f++) {
    const x = f * fw, y = r * fh, bob = Math.sin((f / cols) * Math.PI * 2) * fh * 0.03;
    g.fillStyle = color; g.globalAlpha = 0.85;
    g.beginPath(); g.ellipse(x + fw / 2, y + fh * 0.32 + bob, fw * 0.12, fh * 0.12, 0, 0, Math.PI * 2); g.fill();
    g.fillRect(x + fw * 0.38, y + fh * 0.44 + bob, fw * 0.24, fh * 0.46);
    g.globalAlpha = 1; g.fillStyle = '#fff'; g.font = `${Math.round(fh * 0.14)}px monospace`;
    g.fillText(`${r}:${f}`, x + 4, y + fh * 0.16);
  }
  return c;
}

export class SpriteSheet {
  constructor(image, frameWidth, frameHeight) {
    if (!(frameWidth > 0 && frameHeight > 0)) throw new RangeError('frame size must be positive');
    this.image = image; this.fw = frameWidth; this.fh = frameHeight;
    this.cols = Math.max(1, Math.floor(image.width / frameWidth));
    this.rows = Math.max(1, Math.floor(image.height / frameHeight));
    this.placeholder = false;
  }

  /** 시트 로드. 실패하면 placeholder 시트로 대체하고 경고만 남김 */
  static async load(src, frameWidth, frameHeight, { rows = 6, cols = 8, color } = {}) {
    const key = `${src}|${frameWidth}x${frameHeight}`;
    if (cache.has(key)) return cache.get(key);
    const task = (async () => {
      try {
        const img = new Image();
        img.decoding = 'async';
        img.src = src;
        await img.decode();
        return new SpriteSheet(img, frameWidth, frameHeight);
      } catch (err) {
        console.warn(`스프라이트를 불러오지 못해 대체 이미지를 씁니다: ${src}`, err);
        const s = new SpriteSheet(placeholderSheet(frameWidth, frameHeight, rows, cols, color), frameWidth, frameHeight);
        s.placeholder = true;
        return s;
      }
    })();
    cache.set(key, task);
    return task;
  }

  /**
   * 한 프레임 그리기. (x, y)는 캐릭터 발 위치.
   * opts: { flip, scale, anchor:{x,y}, alpha, flash, motion:{dx,dy,sx,sy,rot} }
   */
  drawFrame(ctx, row, col, x, y, { flip = false, scale = 1, anchor = { x: 0.5, y: 1 }, alpha = 1, flash = false, motion = null, pixelArt = true } = {}) {
    if (row >= this.rows || col >= this.cols) return;
    const w = this.fw * scale, h = this.fh * scale;
    ctx.save();
    ctx.globalAlpha = alpha;
    // 픽셀 아트는 원본 픽셀 격자(= scale 단위)에 맞춰 고정, 고해상도 시트는 그대로
    if (pixelArt) ctx.translate(Math.round(x / scale) * scale, Math.round(y / scale) * scale); else ctx.translate(x, y);
    if (flip) ctx.scale(-1, 1);
    if (motion) { ctx.translate(motion.dx ?? 0, motion.dy ?? 0); ctx.rotate(motion.rot ?? 0); ctx.scale(motion.sx ?? 1, motion.sy ?? 1); }
    if (flash) ctx.filter = 'brightness(3)';
    ctx.imageSmoothingEnabled = ctx.webkitImageSmoothingEnabled = ctx.mozImageSmoothingEnabled = !pixelArt;
    if (!pixelArt) ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(this.image, col * this.fw, row * this.fh, this.fw, this.fh, -w * anchor.x, -h * anchor.y, w, h);
    ctx.restore();
  }
}

export class Animator {
  /** @param {SpriteSheet} sheet  @param {object} animDef units.json의 animation 항목 */
  /** @param {SpriteSheet} sheet 기본 시트  @param {object} animDef  @param {Map<string,SpriteSheet>} sheets 동작별 시트 (state.sheet 경로 → 시트) */
  constructor(sheet, animDef, sheets = new Map()) {
    if (!sheet || !animDef?.states) throw new TypeError('sheet and animation.states are required');
    this.sheet = sheet; this.def = animDef; this.sheets = sheets;
    this.current = null; this.frame = 0; this.time = 0; this.done = false; this.elapsed = 0; this.clock = 0;
    this.listeners = new Set();
    this.play('idle');
  }
  on(type, fn) { if (type === 'event') this.listeners.add(fn); return () => this.listeners.delete(fn); }

  state(name) { return this.def.states[name] ?? this.def.states.idle; }
  /** 원샷 상태 재생 시간(초) */
  duration(name) { const s = this.state(name); return s.frames / s.fps; }

  play(name, { restart = false } = {}) {
    if (this.current === name && !restart) return;
    this.current = name; this.frame = 0; this.time = 0; this.done = false; this.elapsed = 0;
    this.#fire(0);
  }

  update(dt) {
    const s = this.state(this.current);
    this.elapsed += dt; this.clock += dt;
    if (this.done) return;
    this.time += dt;
    const step = 1 / s.fps;
    while (this.time >= step) {
      this.time -= step;
      if (this.frame + 1 < s.frames) { this.frame++; this.#fire(this.frame); }
      else if (s.loop) { this.frame = 0; this.#fire(0); }
      else { this.done = true; break; }
    }
  }

  #fire(frame) {
    const ev = this.state(this.current).events?.[frame];
    if (!ev) return;
    for (const fn of this.listeners) { try { fn({ name: ev, state: this.current, frame }); } catch (err) { console.error(err); } }
  }

  /**
   * 프레임 수가 적은 시트를 위한 절차적 움직임. u(유닛)가 있으면 속도 · 공중 · 착지 · 방향 전환까지 반영
   * 회전은 발 기준, 양수 = 앞으로 기울기 (좌우 반전 후 적용)
   */
  motion(u = null) {
    const P = u?.profile ?? {}, mass = P.mass ?? 1, g = P.gait ?? { freq: 1, hop: 1, lean: 1, squash: 1 };
    const p = Math.min(1, this.elapsed / Math.max(0.01, this.duration(this.current))), t = this.clock + (u?.phase ?? 0);
    const ease = q => 1 - (1 - q) ** 3, back = q => 1 + 2.7 * (q - 1) ** 3 + 1.7 * (q - 1) ** 2;
    let m;
    switch (this.current) {
      case 'idle': m = { sy: 1 + Math.sin(t * 3.2 / mass) * 0.025 / mass, sx: 1 - Math.sin(t * 3.2 / mass) * 0.012 }; break;
      case 'move': {
        const sp = u ? Math.min(1.6, Math.hypot(u.vx, u.vz) / 160) : 1, ph = t * (10 + sp * 5) * g.freq, c = Math.abs(Math.cos(ph));
        m = P.glide ? { rot: 0.05 * sp, sx: 1 + 0.015 * sp }   // 성직자 · 마법사: 걸음 없이 미끄러짐
          : { dy: -Math.abs(Math.sin(ph)) * (3 + sp * 3) * g.hop, rot: (0.06 * sp + Math.sin(ph) * 0.05) * g.lean,
              sy: 1 - c * 0.04 * g.squash, sx: 1 + c * 0.03 * g.squash };   // 전사: 디딜 때 크게 눌림 / 궁수: 높게 튐
        break;
      }
      case 'attack': {   // 예비 동작 → 찌르기(오버슈트) → 복귀. 전사: 길게 젖혔다 묵직하게 / 도적: 예비동작 거의 없이 길게 찌름
        const a = P.windup ?? 0.3, b = a + 0.3, L = P.lunge ?? 22, W = 8 * mass;
        m = p < a ? { dx: -W * ease(p / a), rot: -0.14 * mass * ease(p / a), sy: 1 - 0.06 * mass, sx: 1.04 }
          : p < b ? { dx: -W + (L + W) * back((p - a) / 0.3), rot: -0.14 * mass + (0.14 * mass + 0.16) * ease((p - a) / 0.3), sx: 1.1, sy: 0.93 }
            : { dx: L * (1 - ease((p - b) / (1 - b))), rot: 0.16 * (1 - ease((p - b) / (1 - b))) };
        break;
      }
      case 'skill':    // 웅크림 → 도약하며 크게 휘두름
        m = p < 0.28 ? { dx: -10 * ease(p / 0.28), dy: 4 * ease(p / 0.28), sy: 0.86, sx: 1.1, rot: -0.18 * ease(p / 0.28) }
          : { dx: -10 + 34 * ease(Math.min(1, (p - 0.28) / 0.3)), dy: -14 * Math.sin(Math.min(1, (p - 0.28) / 0.5) * Math.PI), sx: 1.06, sy: 1.04, rot: -0.18 + 0.38 * ease(Math.min(1, (p - 0.28) / 0.3)) - 0.2 * Math.max(0, (p - 0.6) / 0.4) };
        break;
      case 'hit': m = { dx: -12 * (1 - ease(p)), rot: -0.22 * (1 - ease(p)), sx: 1 - 0.08 * (1 - p), sy: 1 + 0.06 * (1 - p) }; break;
      case 'die': { const q = ease(Math.min(1, p * 2.2)); m = { dx: -14 * q, dy: 6 * q, rot: -1.35 * q, sy: 1 - 0.1 * q }; break; }
      default: m = {};
    }
    if (u && this.current !== 'die') {
      const air = u.y - (u.fy ?? 0);
      if (air > 1) {   // 공중: 올라갈 때 늘어나고 내려올 때 앞으로 숙임
        const up = Math.max(-1, Math.min(1, u.vy / 500));
        m.sx = (m.sx ?? 1) * (1 - 0.08 * up); m.sy = (m.sy ?? 1) * (1 + 0.1 * up); m.rot = (m.rot ?? 0) + (up > 0 ? -0.06 : 0.08) * Math.abs(up);
        if (this.current !== 'attack' && this.current !== 'skill') m.dy = 0;
      }
      const lean = Math.max(-0.12, Math.min(0.12, (u.acc ?? 0) * (u.facing ?? 1) / 2000));
      m.rot = (m.rot ?? 0) + (P.glide ? -lean * 0.8 : lean * 0.6);   // 달리기: 출발 때 숙임 / 로브: 반대로 끌림
      if (P.glide) {   // 공중 부양 + 로브 좌우 흔들림 (그림만 뜨고 그림자는 바닥에 남음)
        m.dy = (m.dy ?? 0) - (P.float ?? 0) - Math.sin(t * 2.2) * 2;
        m.rot += Math.sin(t * 1.7) * 0.025;
      }
      if (u.landT > 0) { const k = u.landT / (P.land ?? 0.18); m.sx = (m.sx ?? 1) * (1 + 0.18 * k * mass); m.sy = (m.sy ?? 1) * (1 - 0.2 * k * mass); }
      if (u.turnT > 0) m.sx = (m.sx ?? 1) * (1 - 0.35 * (u.turnT / (P.turn || 0.12)));
    }
    return m;
  }

  draw(ctx, x, y, { facing = 1, alpha = 1, flash = false, unit = null } = {}) {
    const s = this.state(this.current), sheet = (s.sheet && this.sheets.get(s.sheet)) || this.sheet;
    sheet.drawFrame(ctx, s.row ?? 0, (s.col ?? 0) + this.frame, x, y, {
      flip: facing < 0, scale: this.def.scale ?? 1, anchor: this.def.anchor ?? { x: 0.5, y: 1 }, alpha, flash, motion: this.motion(unit), pixelArt: this.def.pixelArt !== false,
    });
  }
}

/** 유닛 정의(또는 영웅 변종)로 Animator 생성 */
export async function createAnimator(animDef, basePath = '') {
  animDef = resolveAnim(animDef);
  const states = Object.values(animDef.states);
  const rows = Math.max(...states.map(s => s.row ?? 0)) + 1;
  const cols = Math.max(...states.map(s => (s.col ?? 0) + s.frames));
  const sheet = await SpriteSheet.load(basePath + animDef.sheet, animDef.frameWidth, animDef.frameHeight, { rows, cols });
  // 동작별 개별 고해상도 시트: states.attack = { sheet: 'sprites/x_attack.png', frameWidth: 128, frameHeight: 128, frames: 6, ... }
  const sheets = new Map();
  for (const s of states) {
    if (!s.sheet || sheets.has(s.sheet)) continue;
    sheets.set(s.sheet, await SpriteSheet.load(basePath + s.sheet, s.frameWidth ?? animDef.frameWidth, s.frameHeight ?? animDef.frameHeight, { rows: (s.row ?? 0) + 1, cols: (s.col ?? 0) + s.frames }));
  }
  return new Animator(sheet, animDef, sheets);
}

/** 벨트스크롤 렌더링: 그림자 → z 정렬 → 스프라이트 */
export function renderUnits(ctx, units, { camX = 0, groundY = 330 } = {}) {
  const sorted = [...units].sort((a, b) => a.z - b.z);
  for (const u of sorted) {
    const sx = u.x - camX, sy = groundY + u.z - u.y;
    const air = Math.max(0, u.y - (u.fy ?? 0)), sh = Math.max(0.45, 1 - air / 220);   // 높이 뜰수록 그림자 작게
    ctx.fillStyle = `rgba(0,0,0,${0.4 * sh})`;
    ctx.beginPath(); ctx.ellipse(sx, groundY + u.z - (u.fy ?? 0), 26 * sh, 7 * sh, 0, 0, Math.PI * 2); ctx.fill();
    u.animator?.draw(ctx, sx, sy, { facing: u.facing, alpha: u.state === 'die' ? Math.max(0, 1 - (u.stateTime - 0.6) * 2) : 1, flash: u.state === 'hit' && u.stateTime < 0.1, unit: u });
  }
}
