// 장비 · 등급 · 드랍 확률 (sprites/equip_icons.png: 행 = 직업×세트, 열 = 등급×부위, 26px)
export const ICON = { src: 'sprites/equip_icons.png', size: 26, cols: 28 };

export const RARITY = [
  { k: 'N', n: '일반', c: '#c8c8c8', m: 1 },
  { k: 'R', n: '고급', c: '#45d96a', m: 1.35 },
  { k: 'RR', n: '희귀', c: '#4a9bff', m: 1.8 },
  { k: 'RRR', n: '영웅', c: '#b066ff', m: 2.4 },
  { k: 'S', n: '전설', c: '#ffd23a', m: 3.2 },
  { k: 'SS', n: '신화', c: '#ff8a1e', m: 4.3 },
  { k: 'SSS', n: '초월', c: '#ff3b3b', m: 6 },
];
export const SETS = [
  { n: '수습', from: 1 }, { n: '노비스', from: 2 }, { n: '어드벤처', from: 4 }, { n: '마스터', from: 7 },
];
export const SLOTS = ['무기', '갑옷', '장갑', '각반'];
const CLS_ROW = { bladesinger: 0, time_mage: 1, iron_cleric: 2, spirit_ranger: 3, warrior: 2 };
const WEAPON = { bladesinger: '단검', spirit_ranger: '활', time_mage: '지팡이', iron_cleric: '철퇴', warrior: '장검' };

/**
 * 드랍 확률(%) — 화면에 그대로 노출. 전설(S) 기대 횟수: 네임드 2,000회 · 던전 보스 500회 · 레이드 100회
 * 일반/정예 몬스터는 전설 0% (잡템 · 재료 · 입장권 위주는 rpg.js rollMats)
 */
export const DROP = {
  normal: { name: '일반 몬스터', chance: 40, rates: [85, 13.5, 1.4, 0.1, 0, 0, 0] },
  elite: { name: '정예 몬스터', chance: 80, rates: [70, 25, 4.5, 0.5, 0, 0, 0] },
  named: { name: '필드 네임드', chance: 100, rates: [45, 40, 12, 2.95, 0.05, 0, 0] },
  boss: { name: '던전 보스', chance: 100, rates: [50, 38, 9.8, 2, 0.2, 0, 0] },
  raid: { name: '최종 레이드 보스', chance: 100, rates: [20, 40, 25, 14, 1, 0, 0] },
  shop: { name: '상점 진열', chance: 100, rates: [60, 30, 10, 0, 0, 0, 0] },
};
/** 0.00001 같은 작은 확률도 지수 표기 없이 */
export const fmtRate = v => (v >= 1 ? `${v}%` : `${Number(v.toPrecision(3)).toFixed(8).replace(/0+$/, '').replace(/\.$/, '')}%`);
export const NEXT_SET_CHANCE = 15;   // 현재 세트보다 한 단계 위 세트가 나올 확률(%)

export const setForStage = stage => SETS.reduce((t, s, i) => (stage >= s.from ? i : t), 0);

function pick(rates, minR, rng) {
  const w = rates.map((x, i) => (i < minR ? 0 : x));
  const sum = w.reduce((a, b) => a + b, 0) || 1;
  let t = rng() * sum;
  for (let i = 0; i < w.length; i++) if ((t -= w[i]) < 0) return i;
  return w.length - 1;
}

/** 장비 1개 생성. source: DROP 키, minR: 최소 등급 */
export function rollGear(cls, stage, source = 'normal', { minR = 0, slot, rng = Math.random } = {}) {
  const table = DROP[source] ?? DROP.normal;
  const r = Math.min(6, pick(table.rates, minR, rng));
  let t = setForStage(Math.max(1, stage));
  if (t < SETS.length - 1 && rng() * 100 < NEXT_SET_CHANCE) t++;
  return makeGear(cls, t, r, slot ?? Math.floor(rng() * 4), 0.9 + rng() * 0.2);
}

/** enh: 강화 단계(+8%/단계) · dur: 내구도(0이면 능력치 절반) */
export function makeGear(cls, t, r, slot, roll = 1, { enh = 0, dur = 100 } = {}) {
  // 체감되도록 기본 공격력 대비 크게: 일반 무기만 껴도 공격력 약 +70%
  const q = Math.round(roll * 100) / 100, g = { cls, t, r, slot, q, enh, dur };
  const p = RARITY[r].m * (1 + 0.65 * t) * q * (1 + 0.08 * enh) * (dur > 0 ? 1 : 0.5);
  if (slot === 0) g.atk = Math.round(45 * p);
  else if (slot === 1) { g.def = Math.round(15 * p); g.hp = Math.round(120 * p); }
  else if (slot === 2) g.atk = Math.round(15 * p);
  else g.hp = Math.round(200 * p);
  g.name = `${enh ? `+${enh} ` : ''}${SETS[t].n} ${slot === 0 ? WEAPON[cls] ?? '무기' : SLOTS[slot]}`;
  return g;
}

export const gearPower = g => (g.atk ?? 0) * 3 + (g.def ?? 0) * 4 + (g.hp ?? 0) * 0.3;
export const gearPrice = g => Math.max(10, Math.round(gearPower(g) * 0.6));
export const gearText = g => [g.atk && `공격 +${g.atk}`, g.def && `방어 +${g.def}`, g.hp && `체력 +${g.hp}`, g.dur != null && g.dur < 100 && `내구 ${g.dur}`].filter(Boolean).join(' · ');

/** 장착 장비 합산 → Character.equip 형식 */
export function gearBonus(gear) {
  const sum = { atk: 0, def: 0, hp: 0 };
  for (const g of Object.values(gear ?? {})) if (g) for (const k in sum) sum[k] += g[k] ?? 0;
  return sum;
}

export function iconStyle(g, px = 32) {
  const s = px / ICON.size, row = (CLS_ROW[g.cls] ?? 0) * 4 + (g.t ?? 0), col = (g.r ?? 0) * 4 + (g.slot ?? 0);
  return `background-image:url(${ICON.src});background-size:${ICON.cols * px}px auto;background-position:${-col * px}px ${-row * px}px;width:${px}px;height:${px}px`;
}
export function iconRect(g) {
  const z = ICON.size;
  return [((g.r ?? 0) * 4 + (g.slot ?? 0)) * z, ((CLS_ROW[g.cls] ?? 0) * 4 + (g.t ?? 0)) * z, z, z];
}

/** 저장된 장비 능력치를 현재 공식으로 다시 계산 */
export const refreshGear = g => (g && g.slot != null ? Object.assign(g, makeGear(g.cls, g.t ?? 0, g.r ?? 0, g.slot, g.q ?? 1, { enh: g.enh ?? 0, dur: g.dur ?? 100 })) : g);

/** 예전 저장(무기만, 등급 0~4, RUN.eq)을 새 형식으로 */
export function migrateRun(run) {
  if (!run || run.gear) return run;
  const conv = w => (w && w.slot != null ? w : makeGear(run.cls, 0, Math.min(6, w?.r ?? 0), 0));
  const bag = (run.bag ?? []).map(conv);
  const eqi = Math.min(Math.max(0, run.eq ?? 0), bag.length - 1);
  run.gear = { 0: bag.length ? bag.splice(eqi, 1)[0] : makeGear(run.cls, 0, 0, 0) };
  run.bag = bag; delete run.eq;
  run.shop = null;
  return run;
}
