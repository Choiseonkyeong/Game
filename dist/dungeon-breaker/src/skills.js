// 스킬 매니저: 계열별 스킬 DB 로드 · 상태이상(기절 · 둔화 · 빙결 · 독) · 자기 버프(슈퍼아머 · 마나 실드 · 무적 · 재생 · 독 바르기)
// 화면 · 판정(히트박스 · 투사체 · 지역)은 index.html 이 맡고, 이 모듈은 유닛 상태만 다룬다

/** data/skills.json 불러오기 */
export async function loadSkillDB(url = 'data/skills.json') {
  let res;
  try { res = await fetch(url); } catch (err) { throw new Error(`스킬 데이터를 불러오지 못했습니다: ${err.message}`); }
  if (!res.ok) throw new Error(`스킬 데이터 응답 오류: HTTP ${res.status}`);
  const db = await res.json();
  if (!db?.classes) throw new Error('skills.json 형식이 올바르지 않습니다');
  for (const [line, c] of Object.entries(db.classes)) {
    if (!Array.isArray(c.skills) || c.skills.length !== 4) throw new Error(`${line} 계열 스킬은 Q·W·E·R 4개여야 합니다`);
  }
  return db;
}

/** 영웅 정의에 계열 스킬 연결: heroDef.skills = Q·W·E·R (CLASS_OF: 영웅 id → 계열) */
export function attachSkills(heroes, db, classOf) {
  for (const [id, def] of heroes) {
    const line = db.classes[classOf[id]];
    if (line) def.skills = line.skills.map(s => ({ ...s, anim: 'skill' }));
  }
}

const st = u => (u.st ??= {});

/** 맞은 대상에게 상태이상 적용. src: 시전자 (독 피해 계산용) */
export function applyStatus(tg, ef, src) {
  if (!tg?.alive) return;
  const s = st(tg), boss = tg.tier === 'boss' || tg.tier === 'named';
  switch (ef.kind) {
    case 'knockback': case 'launch': if (!boss) tg.vx = Math.sign(tg.x - (src?.x ?? tg.x - 1)) * (ef.value ?? 8) * 30; break;
    case 'stun': s.stun = Math.max(s.stun ?? 0, (ef.duration ?? 1) * (boss ? 0.3 : 1)); tg.vx = tg.vz = 0; break;   // 보스 · 네임드는 30%
    case 'freeze': tg.frozen = Math.max(tg.frozen ?? 0, (ef.duration ?? 1) * (boss ? 0.3 : 1)); break;
    case 'slow': s.slow = Math.max(s.slow ?? 0, ef.duration ?? 2); tg.addModifier('st:slow', { stat: 'moveSpeed', mul: ef.mul ?? 0.5, duration: ef.duration ?? 2 }); break;
    case 'poison': s.poison = { t: ef.duration ?? 4, dps: (src?.stats.atk ?? 10) * (ef.dps ?? 0.3), acc: 0, timer: 0, src }; break;
    default: break;
  }
}

/** 시전자 자신에게 버프 적용 */
export function applySelf(u, ef) {
  const s = st(u);
  switch (ef.kind) {
    case 'statBuff': u.addModifier(`buff:${ef.stat}`, { stat: ef.stat, mul: ef.mul, duration: ef.duration }); break;
    case 'superArmor': s.superArmor = ef.duration; u.superArmor = true; break;
    case 'heal': u.heal(u.stats.hp * (ef.ratio ?? 0.2)); break;
    case 'poisonCoat': s.coat = { n: ef.count ?? 3, dps: ef.dps ?? 0.3, duration: ef.duration ?? 4 }; break;
    case 'manaShield': s.mshield = { t: ef.duration ?? 8, ratio: ef.ratio ?? 0.7, mp: ef.mpPerDamage ?? 0.5 }; break;
    case 'invuln': s.invuln = ef.duration ?? 3; break;
    case 'regen': s.regen = { t: ef.duration ?? 5, ratio: ef.ratio ?? 0.03 }; break;
    default: break;
  }
}

/** 기본 공격 시작 시: 독 바르기 횟수를 1 소모하고 이번 공격에 붙일 효과 반환 */
export function consumeCoat(u) {
  const c = u.st?.coat;
  if (!c || c.n <= 0) return [];
  c.n--; if (c.n <= 0) delete u.st.coat;
  return [{ kind: 'poison', dps: c.dps, duration: c.duration }];
}

/** 받는 피해 필터 (Character.damageFilter): 무적 → 0, 마나 실드 → 일부를 MP로 흡수 */
export function filterDamage(u, amount) {
  const s = u.st;
  if (!s) return amount;
  if (s.invuln > 0) return 0;
  const m = s.mshield;
  if (m && u.mp > 0) {
    const absorb = Math.min(amount * m.ratio, u.mp / m.mp);
    u.mp -= absorb * m.mp;
    if (u.mp <= 0.5) delete s.mshield;
    return amount - absorb;
  }
  return amount;
}

/** 매 프레임: 상태 시간 감소 · 독 피해 · 재생. onDot(u, dmg)로 독 피해 처리 */
export function tickStatus(u, dt, onDot) {
  const s = u.st; if (!s || !u.alive) return;
  for (const k of ['stun', 'slow', 'invuln']) if (s[k] > 0) s[k] = Math.max(0, s[k] - dt);
  if (s.superArmor > 0 && (s.superArmor -= dt) <= 0) { s.superArmor = 0; u.superArmor = !!u.def.ai?.superArmor; }
  if (s.mshield && (s.mshield.t -= dt) <= 0) delete s.mshield;
  if (s.regen) { u.heal(u.stats.hp * s.regen.ratio * dt); if ((s.regen.t -= dt) <= 0) delete s.regen; }
  if (s.poison) {
    const p = s.poison; p.acc += p.dps * dt; p.t -= dt; p.timer += dt;
    if (p.timer >= 0.5 || p.t <= 0) { if (p.acc >= 1) onDot?.(u, Math.round(p.acc), p.src); p.acc = 0; p.timer = 0; }   // 0.5초마다 묶어서
    if (p.t <= 0) delete s.poison;
  }
}
export const isStunned = u => (u.st?.stun ?? 0) > 0;

/** 머리 위 상태 표시 */
export function statusLabels(u) {
  const s = u.st ?? {}, out = [];
  if (u.frozen > 0) out.push(['빙결', '#9fd8ff']);
  if (s.stun > 0) out.push(['기절', '#ffe066']);
  if (s.slow > 0) out.push(['둔화', '#7ab8ff']);
  if (s.poison) out.push(['독', '#7dff6a']);
  return out;
}
/** 영웅 버프 HUD 문구 */
export function buffText(u) {
  const s = u.st ?? {}, out = [];
  if (s.superArmor > 0) out.push(`슈퍼아머 ${s.superArmor.toFixed(1)}`);
  if (s.invuln > 0) out.push(`무적 ${s.invuln.toFixed(1)}`);
  if (s.mshield) out.push(`마나 실드 ${s.mshield.t.toFixed(1)}`);
  if (s.regen) out.push(`재생 ${s.regen.t.toFixed(1)}`);
  if (s.coat) out.push(`독 바르기 ${s.coat.n}회`);
  for (const [id, m] of u.modifiers) if (id.startsWith('buff:') && m.expires > 0) out.push(`${{ atk: '공격', attackSpeed: '공속', def: '방어' }[m.stat] ?? m.stat} ×${m.mul} ${m.expires.toFixed(1)}`);
  return out.join(' · ');
}
