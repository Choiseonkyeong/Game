// 캐릭터 · 몬스터 엔티티 (ES 모듈, 의존성 없음)
export const State = Object.freeze({ IDLE: 'idle', MOVE: 'move', ATTACK: 'attack', SKILL: 'skill', HIT: 'hit', DIE: 'die' });

// 현재 상태 → 전환 가능한 상태
const TRANSITIONS = {
  idle: ['move', 'attack', 'skill', 'hit', 'die'],
  move: ['idle', 'attack', 'skill', 'hit', 'die'],
  attack: ['idle', 'skill', 'hit', 'die'],
  skill: ['idle', 'hit', 'die'],
  hit: ['idle', 'hit', 'die'],
  die: [],
};
// 애니메이션이 없을 때 쓰는 기본 지속시간(초)
const FALLBACK_DURATION = { attack: 0.4, skill: 0.7, hit: 0.3, die: 0.8 };
const GRAVITY = 1600;
const ONE_SHOT = new Set(['attack', 'skill', 'hit', 'die']);
const RATIO_STATS = new Set(['critRate']);

let nextId = 1;

// 계열별 이동 성격. accel/decel: 초당 목표 속도를 따라가는 빠르기, spring: 탄성(0=없음), turn: 방향 전환 연출 시간,
// react: 출발·정지 반응 지연 최대값(초), land: 착지 찌그러짐 시간, mass: 무게(연출 크기), glide: 걸음 없이 미끄러짐, float: 부양 높이
// gait: 걸음 {freq 빠르기, hop 튀는 높이, lean 기울기, squash 찌그러짐}, windup: 공격 예비동작 비율, lunge: 찌르기 거리
export const MOVE_PROFILES = {
  warrior: { accel: 5, decel: 4, turn: 0.2, land: 0.26, mass: 1.3, gait: { freq: 0.8, hop: 0.7, lean: 0.7, squash: 1.8 }, windup: 0.4, lunge: 18 },
  rogue: { accel: 24, decel: 20, turn: 0.05, land: 0.1, mass: 0.8, gait: { freq: 1.4, hop: 0.8, lean: 1.8, squash: 0.6 }, windup: 0.14, lunge: 34 },
  archer: { accel: 10, decel: 9, spring: 0.35, turn: 0.1, land: 0.16, mass: 1, gait: { freq: 1.1, hop: 1.6, lean: 0.9, squash: 1.4 }, windup: 0.3, lunge: 6 },
  cleric: { accel: 4, decel: 2.5, turn: 0.16, land: 0.2, mass: 1.05, glide: true, float: 2, windup: 0.3, lunge: 12 },
  mage: { accel: 4.5, decel: 2.2, turn: 0.14, land: 0.2, mass: 0.9, glide: true, float: 7, windup: 0.3, lunge: 4 },
  default: { accel: 10, decel: 8, turn: 0.12, react: 0.14, land: 0.18, mass: 1 },
};

class Emitter {
  #handlers = new Map();
  on(type, fn) {
    if (typeof fn !== 'function') throw new TypeError('handler must be a function');
    if (!this.#handlers.has(type)) this.#handlers.set(type, new Set());
    this.#handlers.get(type).add(fn);
    return () => this.#handlers.get(type)?.delete(fn);
  }
  emit(type, payload) {
    for (const fn of this.#handlers.get(type) ?? []) {
      try { fn(payload); } catch (err) { console.error(`[${type}] handler error`, err); }
    }
  }
}

function assertDef(def, fields) {
  if (!def || typeof def !== 'object') throw new TypeError('unit definition is required');
  for (const f of fields) if (def[f] == null) throw new TypeError(`unit "${def.id ?? '?'}" is missing "${f}"`);
}

export class Character extends Emitter {
  /** @param {object} def units.json 항목  @param {{x?:number,z?:number,level?:number,animator?:object}} opts */
  constructor(def, { x = 0, z = 0, level = 1, animator = null } = {}) {
    super();
    assertDef(def, ['id', 'stats']);
    this.uid = nextId++;
    this.def = def;
    this.level = Math.max(1, level | 0);
    this.x = x; this.z = z; this.y = 0; this.fy = 0;   // fy: 서 있는 바닥 높이
    this.vx = 0; this.vz = 0; this.vy = 0;
    this.tvx = 0; this.tvz = 0;     // 이동 목표 속도 (가속 · 감속으로 따라감)
    this.landT = 0; this.turnT = 0; // 착지 찌그러짐 · 방향 전환 연출 남은 시간
    this.profile = MOVE_PROFILES.default;
    this.ax = this.az = 0; this.acc = 0;            // 탄성용 가속도 · 연출용 가속도(기울기)
    this.react = 0; this.pend = null;               // 출발·정지 지연 중인 목표 속도
    this.phase = Math.random() * Math.PI * 2;       // 무리의 흔들림 박자를 서로 어긋나게
    this.facing = 1;
    this.modifiers = new Map();     // id → { stat, mul?, add?, expires? }
    this.cooldowns = new Map();     // skillId → 남은 초
    this.state = State.IDLE;
    this.stateTime = 0;
    this.stateDuration = Infinity;
    this.animator = animator;
    this.superArmor = false;
    this.stats = this.applyStats();
    this.hp = this.stats.hp;
    this.mp = this.stats.mp ?? 0;
    animator?.on?.('event', e => this.emit('animEvent', { ...e, unit: this }));
  }

  get alive() { return this.state !== State.DIE; }

  /** 기본 스탯 + 레벨 성장 + 변종 배율 + 모디파이어 적용 결과 반환 */
  applyStats() {
    const base = { ...this.def.stats }, growth = this.def.growth ?? {}, lv = this.level - 1;
    for (const [k, v] of Object.entries(growth)) if (k in base) base[k] += v * lv;
    for (const [k, mul] of Object.entries(this.variantMods ?? {})) if (k in base) base[k] *= mul;
    for (const m of this.modifiers.values()) {
      if (!(m.stat in base)) continue;
      base[m.stat] = (base[m.stat] + (m.add ?? 0)) * (m.mul ?? 1);
    }
    for (const k of Object.keys(base)) base[k] = RATIO_STATS.has(k) ? Math.min(1, Math.max(0, base[k])) : Math.max(0, base[k]);
    return base;
  }

  /** 스탯 재계산 후 HP/MP 비율 유지 */
  refreshStats() {
    const hpR = this.stats.hp ? this.hp / this.stats.hp : 1, mpR = this.stats.mp ? this.mp / this.stats.mp : 1;
    this.stats = this.applyStats();
    this.hp = Math.min(this.stats.hp, Math.round(this.stats.hp * hpR));
    this.mp = Math.min(this.stats.mp ?? 0, Math.round((this.stats.mp ?? 0) * mpR));
  }

  addModifier(id, { stat, mul, add, duration } = {}) {
    if (!stat) throw new TypeError('modifier needs a stat');
    this.modifiers.set(id, { stat, mul, add, expires: duration ? duration : null });
    this.refreshStats();
  }
  removeModifier(id) { if (this.modifiers.delete(id)) this.refreshStats(); }

  canTransition(next) { return TRANSITIONS[this.state]?.includes(next) ?? false; }

  setState(next, { force = false } = {}) {
    if (this.state === next && !ONE_SHOT.has(next)) return true;
    if (!force && !this.canTransition(next)) return false;
    const prev = this.state;
    this.state = next; this.stateTime = 0;
    const animDur = this.animator?.duration?.(next);
    this.stateDuration = ONE_SHOT.has(next) ? (animDur ?? FALLBACK_DURATION[next]) : Infinity;
    this.animator?.play?.(next, { restart: true });
    this.emit('state', { unit: this, prev, next });
    return true;
  }

  /** dirX, dirZ: -1~1 입력 방향 */
  move(dirX, dirZ = 0) {
    if (!this.alive || (this.state !== State.IDLE && this.state !== State.MOVE)) return;
    const P = this.profile, len = Math.hypot(dirX, dirZ), sp = this.stats.moveSpeed / Math.max(1, len);
    const tx = len < 0.01 ? 0 : dirX * sp, tz = len < 0.01 ? 0 : dirZ * sp * 0.6;
    const moving = !!(this.tvx || this.tvz), want = !!(tx || tz);
    if (this.pend) this.pend = { tx, tz };                                   // 지연 중: 최신 입력만 갱신
    else if (P.react && moving !== want) { this.pend = { tx, tz }; this.react = Math.random() * P.react; }   // 출발·정지 순간만 개인 지연
    else { this.tvx = tx; this.tvz = tz; }
    if (dirX && Math.sign(dirX) !== this.facing) { this.facing = Math.sign(dirX); this.turnT = P.turn; }
    this.setState(want ? State.MOVE : State.IDLE);
  }

  /** 발밑 바닥 높이: floorAt(u, 기준 높이)이 있으면 발판, 없으면 0 */
  floor(from = this.y) { return this.floorAt?.(this, from) ?? 0; }

  inRange(target, range = this.stats.attackRange) {
    return !!target && Math.abs(target.x - this.x) <= range && Math.abs(target.z - this.z) <= 24 && Math.abs((target.fy ?? 0) - this.fy) < 30;
  }

  attack(target) {
    if (!this.alive || (this.cooldowns.get('__basic') ?? 0) > 0) return false;
    if (!this.setState(State.ATTACK)) return false;
    if (target) this.facing = Math.sign(target.x - this.x) || this.facing;
    this.vx *= 0.2; this.vz = this.tvx = this.tvz = this.ax = this.az = 0; this.pend = null;   // 달리다 공격하면 살짝 미끄러지며 멈춤
    this.cooldowns.set('__basic', 1 / this.stats.attackSpeed);
    this.emit('attack', { unit: this, target });
    return true;
  }

  findSkill(id) { return this.def.skills?.find(s => s.id === id) ?? null; }

  canUseSkill(id) {
    const sk = this.findSkill(id);
    return !!sk && this.alive && (this.cooldowns.get(id) ?? 0) <= 0 && this.mp >= (sk.mpCost ?? 0);
  }

  useSkill(id, targets = []) {
    const sk = this.findSkill(id);
    if (!sk) { console.warn(`unknown skill: ${id}`); return false; }
    if (!this.canUseSkill(id) || !this.setState(State.SKILL)) return false;
    this.mp -= sk.mpCost ?? 0;
    this.cooldowns.set(id, sk.cooldown);
    this.vx = this.vz = this.tvx = this.tvz = this.ax = this.az = 0; this.pend = null;
    this.emit('skill', { unit: this, skill: sk, targets });
    return true;
  }

  /** 방어력 반영 피해 계산 */
  computeDamage(mul = 1, target = null) {
    const crit = Math.random() < (this.stats.critRate ?? 0);
    const raw = this.stats.atk * mul * (crit ? 1.5 : 1) * (0.9 + Math.random() * 0.2);
    const reduced = raw * (100 / (100 + (target?.stats.def ?? 0)));
    return { amount: Math.max(1, Math.round(reduced)), crit };
  }

  takeDamage(amount, source = null) {
    if (!this.alive || !Number.isFinite(amount) || amount <= 0) return 0;
    if (this.damageFilter) {   // 무적 · 보호막 등 (src/skills.js filterDamage)
      amount = this.damageFilter(amount, source);
      if (!(amount > 0)) { this.emit('blocked', { unit: this, source }); return 0; }
    }
    const dmg = Math.round(amount);
    this.hp = Math.max(0, this.hp - dmg);
    this.emit('damaged', { unit: this, amount: dmg, source });
    if (this.hp <= 0) this.die(source);
    else if (!this.superArmor) { this.vx = (source ? Math.sign(this.x - source.x) : -this.facing) * 60; this.setState(State.HIT); }
    return dmg;
  }

  heal(amount) {
    if (!this.alive || amount <= 0) return;
    this.hp = Math.min(this.stats.hp, this.hp + Math.round(amount));
  }

  die(killer = null) {
    if (!this.alive) return;
    this.vx = this.vz = this.tvx = this.tvz = this.ax = this.az = 0; this.pend = null;
    this.setState(State.DIE, { force: true });
    this.emit('died', { unit: this, killer });
  }

  /** 지상에서만 점프. 공중에서도 이동 · 공격 가능 */
  jump(power = 520) {
    if (!this.alive || this.y > this.floor() + 0.5 || this.state === State.HIT || this.state === State.DIE) return false;
    this.vy = power; this.y += 0.01; this.emit('jump', { unit: this });
    return true;
  }

  update(dt) {
    if (!Number.isFinite(dt) || dt <= 0) return;
    this.stateTime += dt;
    for (const [k, v] of this.cooldowns) this.cooldowns.set(k, Math.max(0, v - dt));
    let expired = false;
    for (const [id, m] of this.modifiers) if (m.expires != null && (m.expires -= dt) <= 0) { this.modifiers.delete(id); expired = true; }
    if (expired) this.refreshStats();
    if (this.state !== State.DIE && ONE_SHOT.has(this.state) && this.stateTime >= this.stateDuration) this.setState(State.IDLE, { force: true });
    const pvx = this.vx, P = this.profile;
    if (this.state === State.HIT) { this.vx *= 0.85; this.ax = this.az = 0; }
    else if (this.state === State.IDLE || this.state === State.MOVE) {   // 직업별 가속 · 감속
      if (this.pend && (this.react -= dt) <= 0) { this.tvx = this.pend.tx; this.tvz = this.pend.tz; this.pend = null; }
      const w = (this.tvx || this.tvz ? P.accel : P.decel) / P.mass;
      if (P.spring) {   // 감쇠 스프링: 목표 속도를 살짝 지나쳤다 돌아옴 (궁수 탄력)
        const c = 2 * (1 - P.spring) * w;
        this.ax += ((this.tvx - this.vx) * w * w - c * this.ax) * dt; this.az += ((this.tvz - this.vz) * w * w - c * this.az) * dt;
        this.vx += this.ax * dt; this.vz += this.az * dt;
      } else { const k = Math.min(1, dt * w); this.vx += (this.tvx - this.vx) * k; this.vz += (this.tvz - this.vz) * k; }
    }
    this.acc += ((this.vx - pvx) / dt - this.acc) * Math.min(1, dt * 8);   // 연출용 (출발 시 숙임 · 로브 끌림)
    this.landT = Math.max(0, this.landT - dt); this.turnT = Math.max(0, this.turnT - dt);
    this.x += this.vx * dt; this.z += this.vz * dt;
    this.fy = this.floor();
    if (this.y > this.fy || this.vy > 0) {                 // 점프 · 낙하 (발판 위에 착지)
      const prev = this.y;
      this.vy -= GRAVITY * dt; this.y += this.vy * dt;
      const f = this.vy <= 0 ? this.floor(prev) : 0;
      if (this.y <= f) {
        const impact = -this.vy; this.y = this.fy = f; this.vy = 0;
        if (impact > 150) { this.landT = P.land; this.emit('land', { unit: this, impact }); }
      }
    }
    this.animator?.update?.(dt);
  }
}

export class Hero extends Character {
  /** @param {object} def hero 정의  @param {{variant?:'male'|'female'}} opts */
  constructor(def, opts = {}) {
    assertDef(def, ['variants']);
    const variant = def.variants.find(v => v.id === opts.variant) ?? def.variants[0];
    super(def, opts);
    this.variant = variant;
    this.variantMods = variant.statMods ?? {};
    this.exp = 0;
    this.weapon = null;
    this.expCurve = opts.expCurve ?? null;       // (level) => 다음 레벨 필요 경험치
    this.maxLevel = opts.maxLevel ?? Infinity;
    this.refreshStats(); this.hp = this.stats.hp; this.mp = this.stats.mp ?? 0;
  }
  get name() { return this.variant.name; }
  expToNext() { return this.level >= this.maxLevel ? Infinity : this.expCurve ? this.expCurve(this.level) : Math.round(160 * this.level ** 1.45); }
  gainExp(n) {
    if (!(n > 0) || this.level >= this.maxLevel) return;
    this.exp += n;
    while (this.exp >= this.expToNext()) {
      this.exp -= this.expToNext(); this.level++;
      this.refreshStats(); this.hp = this.stats.hp; this.mp = this.stats.mp ?? 0;
      this.emit('levelUp', { unit: this, level: this.level });
    }
  }
  /** weapon: 장비 합산 { atk?, def?, hp?, mp? (가산), stats?: {stat: mul} } */
  equip(weapon) {
    for (const id of [...this.modifiers.keys()]) if (id.startsWith('weapon:')) this.modifiers.delete(id);
    this.weapon = weapon ?? null;
    if (weapon) {
      for (const stat of ['atk', 'def', 'hp', 'mp']) if (weapon[stat]) this.modifiers.set(`weapon:${stat}`, { stat, add: weapon[stat] });
      for (const [stat, mul] of Object.entries(weapon.stats ?? {})) this.modifiers.set(`weapon:${stat}`, { stat, mul });
    }
    this.refreshStats();
  }
}

export class Monster extends Character {
  constructor(def, opts = {}) {
    assertDef(def, ['tier']);
    super(def, opts);
    this.tier = def.tier;
    this.superArmor = !!def.ai?.superArmor;
    this.aiTimer = Math.random() * 0.5;
  }
  get name() { return this.def.name; }

  /** 간단한 추적/공격 AI. target: Character */
  think(target, dt) {
    if (!this.alive || !target?.alive || this.state === State.HIT) return;
    if ((this.aiTimer -= dt) > 0) return;
    this.aiTimer = 0.2;
    const dx = target.x - this.x, dz = target.z - this.z, dist = Math.abs(dx);
    if (dist > (this.def.ai?.aggroRange ?? 500)) { this.move(0, 0); return; }
    this.facing = Math.sign(dx) || this.facing;
    const ready = this.def.skills?.filter(s => this.canUseSkill(s.id) && this.isSkillUnlocked(s.id)) ?? [];
    const keep = this.def.ai?.keepDistance ?? 0;
    if (this.inRange(target)) {
      if (ready.length && Math.random() < 0.6) this.useSkill(ready[Math.floor(Math.random() * ready.length)].id, [target]);
      else this.attack(target);
    } else if (keep && dist < keep) this.move(-Math.sign(dx), Math.sign(dz) * 0.5);
    else this.move(Math.sign(dx), Math.abs(dz) > 6 ? Math.sign(dz) : 0);
  }
  isSkillUnlocked() { return true; }

  rollDrops(rng = Math.random) {
    return (this.def.drops ?? []).filter(d => rng() < d.chance).map(d => d.item);
  }
}

export class Boss extends Monster {
  constructor(def, opts = {}) {
    super(def, opts);
    this.superArmor = true;
    this.phaseIndex = -1;
    this.locked = new Set((def.phases ?? []).flatMap(p => p.unlockSkills ?? []));
  }
  isSkillUnlocked(id) { return !this.locked.has(id); }

  takeDamage(amount, source) {
    const dmg = super.takeDamage(amount, source);
    if (this.alive) this.checkPhase();
    return dmg;
  }

  checkPhase() {
    const phases = this.def.phases ?? [], ratio = this.hp / this.stats.hp;
    for (let i = this.phaseIndex + 1; i < phases.length; i++) {
      const ph = phases[i];
      if (ratio > ph.hpBelow) break;
      this.phaseIndex = i;
      for (const [stat, mul] of Object.entries(ph.statMods ?? {})) this.modifiers.set(`phase${i}:${stat}`, { stat, mul });
      for (const id of ph.unlockSkills ?? []) this.locked.delete(id);
      this.refreshStats();
      this.emit('phase', { unit: this, index: i, message: ph.message });
    }
  }
}

/** units.json 항목으로 알맞은 클래스 인스턴스 생성 */
export function createUnit(def, opts = {}) {
  if (def.variants) return new Hero(def, opts);
  if (def.tier === 'boss') return new Boss(def, opts);
  return new Monster(def, opts);
}

/** units.json 불러오기 (네트워크 오류·형식 오류 처리) */
export async function loadUnits(url = 'data/units.json') {
  let res;
  try { res = await fetch(url); } catch (err) { throw new Error(`유닛 데이터를 불러오지 못했습니다: ${err.message}`); }
  if (!res.ok) throw new Error(`유닛 데이터 응답 오류: HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data?.heroes) || !Array.isArray(data?.monsters)) throw new Error('units.json 형식이 올바르지 않습니다');
  return {
    heroes: new Map(data.heroes.map(h => [h.id, h])),
    monsters: new Map(data.monsters.map(m => [m.id, m])),
  };
}
