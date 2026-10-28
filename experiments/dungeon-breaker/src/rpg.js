// 에테르시아: 균열의 시대 — 직업 · 성장 · 경제 · 탈것 규칙 (DOM 없는 순수 데이터/로직)

// ---------- 1. 직업 · 전직 ----------
export const JOB_LEVELS = [1, 30, 60];
// mods: 스탯 배율. 같은 차수 안에서는 두 스타일을 자유롭게 스왑
export const JOBS = {
  warrior: { name: '전사', tiers: [
    [{ id: 'warrior', name: '전사', mods: {} }],
    [{ id: 'berserker', name: '광전사', mods: { atk: 1.15, attackSpeed: 1.1, def: 0.95 } },
      { id: 'guardian', name: '수호기사', mods: { def: 1.3, hp: 1.15 } }],
    [{ id: 'hellbreaker', name: '파멸의 헬브레이커', mods: { atk: 1.35, attackSpeed: 1.2, critRate: 1.2, def: 0.95 } },
      { id: 'paladin', name: '성기사 팔라딘', mods: { def: 1.55, hp: 1.3, atk: 1.1 } }],
  ] },
  rogue: { name: '도적', tiers: [
    [{ id: 'rogue', name: '도적', mods: {} }],
    [{ id: 'assassin', name: '암살자', mods: { atk: 1.12, critRate: 1.5 } },
      { id: 'bladedancer', name: '검무사', mods: { attackSpeed: 1.15, moveSpeed: 1.08 } }],
    [{ id: 'shadowlord', name: '그림자 군주', mods: { atk: 1.3, critRate: 2 } },
      { id: 'thousandblades', name: '천검의 무희', mods: { atk: 1.15, attackSpeed: 1.35, moveSpeed: 1.12 } }],
  ] },
  cleric: { name: '성직자', tiers: [
    [{ id: 'cleric', name: '성직자', mods: {} }],
    [{ id: 'inquisitor', name: '심판관', mods: { atk: 1.15, def: 1.1 } },
      { id: 'priest', name: '프리스트', mods: { mp: 1.3, hp: 1.15, def: 1.1 } }],
    [{ id: 'crusader', name: '성전사 크루세이더', mods: { atk: 1.3, def: 1.3, hp: 1.1 } },
      { id: 'archbishop', name: '대주교', mods: { mp: 1.5, hp: 1.35, def: 1.2, atk: 1.1 } }],
  ] },
  mage: { name: '마법사', tiers: [
    [{ id: 'mage', name: '마법사', mods: {} }],
    [{ id: 'elementalist', name: '원소술사', mods: { atk: 1.18, mp: 1.1 } },
      { id: 'warlock', name: '흑마법사', mods: { atk: 1.1, hp: 1.1, critRate: 1.3 } }],
    [{ id: 'archmage', name: '대마도사 아크메이지', mods: { atk: 1.4, mp: 1.25 } },
      { id: 'necromancer', name: '사신 네크로맨서', mods: { atk: 1.25, hp: 1.25, critRate: 1.5 } }],
  ] },
  archer: { name: '궁수', tiers: [
    [{ id: 'archer', name: '궁수', mods: {} }],
    [{ id: 'sniper', name: '스나이퍼', mods: { atk: 1.15, critRate: 1.4 } },
      { id: 'ranger', name: '레인저', mods: { attackSpeed: 1.15, moveSpeed: 1.08 } }],
    [{ id: 'headshooter', name: '헤드슈터', mods: { atk: 1.35, critRate: 1.8 } },
      { id: 'windarcher', name: '풍신 질풍사수', mods: { atk: 1.15, attackSpeed: 1.3, moveSpeed: 1.15 } }],
  ] },
};
// 영웅 정의(units.json) → 직업 계열. bladesinger는 예전 저장 호환용
// 영웅 정의(units.json) → 전직 계열
export const CLASS_OF = { warrior: 'warrior', bladesinger: 'rogue', iron_cleric: 'cleric', time_mage: 'mage', spirit_ranger: 'archer' };
// 전직 전(0차) 표시 이름은 캐릭터 이름 유지
const BASE_NAME = { warrior: '전사', bladesinger: '로그', spirit_ranger: '아처', time_mage: '메이지', iron_cleric: '클레릭' };

export const jobLine = cls => JOBS[CLASS_OF[cls] ?? 'warrior'];
export function currentJob(run) {
  const tiers = jobLine(run.cls).tiers, t = Math.min(run.job?.tier ?? 0, tiers.length - 1);
  const job = tiers[t][Math.min(run.job?.branch ?? 0, tiers[t].length - 1)];
  return t === 0 && BASE_NAME[run.cls] ? { ...job, name: BASE_NAME[run.cls] } : job;
}
/** 전직 · 스왑 가능 여부. 다음 차수는 레벨 조건, 같은 차수는 자유 스왑 */
export function canSetJob(run, tier, branch) {
  const tiers = jobLine(run.cls).tiers, cur = run.job?.tier ?? 0;
  if (!tiers[tier]?.[branch]) return { ok: false, why: '없는 직업입니다.' };
  if (tier > cur + 1) return { ok: false, why: `${tier - 1}차 전직을 먼저 해야 합니다.` };
  if (tier < cur) return { ok: false, why: '이전 차수로는 돌아갈 수 없습니다.' };
  if (run.level < JOB_LEVELS[tier]) return { ok: false, why: `Lv.${JOB_LEVELS[tier]}부터 가능합니다.` };
  if (tier === cur && branch === (run.job?.branch ?? 0)) return { ok: false, why: '이미 선택한 스타일입니다.' };
  return { ok: true };
}
export function setJob(run, tier, branch) {
  const c = canSetJob(run, tier, branch);
  if (c.ok) run.job = { tier, branch };
  return c;
}

// ---------- 2. 스탯 포인트 · 경험치 곡선 ----------
export const MAX_LEVEL = 100;
export const POINTS_PER_LEVEL = 5;
export const STAT_PER_POINT = { hp: 12, mp: 6, atk: 2, def: 1 };
export const STAT_LABEL = { hp: '체력', mp: '마나', atk: '공격', def: '방어' };
export const pointsTotal = level => (Math.max(1, level) - 1) * POINTS_PER_LEVEL;
export const pointsUsed = alloc => Object.values(alloc ?? {}).reduce((a, b) => a + (b | 0), 0);
export const pointsLeft = run => Math.max(0, pointsTotal(run.level) - pointsUsed(run.alloc));
export function spendPoint(run, stat, n = 1) {
  if (!(stat in STAT_PER_POINT)) return false;
  n = Math.min(n, pointsLeft(run));
  if (n <= 0) return false;
  run.alloc ??= {}; run.alloc[stat] = (run.alloc[stat] ?? 0) + n;
  return true;
}
export const resetCost = level => 100 * level;
export function allocBonus(alloc) {
  const out = {};
  for (const [k, per] of Object.entries(STAT_PER_POINT)) out[k] = (alloc?.[k] ?? 0) * per;
  return out;
}

/**
 * 레벨당 목표 플레이 시간(분). 해당 레벨 사냥터 기준 분당 경험치(expPerMin)로 필요 경험치를 역산
 * Lv.1~30 합계 약 1.6시간 · Lv.31~60 합계 약 33시간(하루 2시간 기준 2~3주)
 * Lv.61~80 레벨당 1~3.6일(하루 2시간) 합계 약 41일 · Lv.81~100 레벨당 8시간~47시간 (명예 · 외형 구간)
 */
export function minutesPerLevel(lv) {
  if (lv < 30) return 1 + lv * 0.15;
  if (lv < 60) return 30 * 1.049 ** (lv - 30);
  if (lv < 80) return 120 * 1.07 ** (lv - 60);
  return 460 * 1.1 ** (lv - 80);
}
export const expPerMin = lv => 80 + 25 * lv;
export const expToNext = lv => (lv >= MAX_LEVEL ? Infinity : Math.round(expPerMin(lv) * minutesPerLevel(lv)));
/** 처치 경험치: 몬스터 레벨이 오를수록 증가 */
export const killExp = (baseExp, monLv) => Math.round((baseExp ?? 20) * (1 + 0.25 * (Math.max(1, monLv) - 1)));

// ---------- 몬스터 난이도 곡선 ----------
// 몬스터 표 수치(units.json stats)는 Lv.11 기준. 그 아래는 HP · 공격력을 줄여 초반을 쉽게 함
// (Lv.1: HP 35% · 공격 30% → Lv.11부터 100%). 레벨 성장(growth)은 표 수치의 10%/Lv · 방어 +1.2/Lv
export function earlyEase(lv) {
  const t = Math.min(1, (Math.max(1, lv) - 1) / 10);
  return { hp: 0.35 + 0.65 * t, atk: 0.3 + 0.7 * t };
}

// ---------- 3. 드랍 · 레벨차 패널티 ----------
/** 캐릭터가 몬스터보다 높을수록 아이템 드랍률 감소 (경험치 · 골드에는 미적용) */
export function levelGapRate(heroLv, monLv) {
  const gap = heroLv - monLv;
  if (gap <= 5) return 1;
  if (gap <= 10) return 0.5;
  if (gap <= 15) return 0.2;
  return 0;
}
export const dropSource = (tier, raid) => (tier === 'boss' ? (raid ? 'raid' : 'boss') : tier === 'named' ? 'named' : tier === 'elite' ? 'elite' : 'normal');

// 재료 드랍: [재료, 확률, 최소, 최대]
export const MATS = {
  junk: { name: '잡동사니', price: 8, c: '#a99db3' },
  ore: { name: '강화석', price: 20, c: '#9fe0ff' },
  ticket: { name: '던전 입장권', price: 150, c: '#ffb400' },
  legendShard: { name: '전설 파편', price: 0, c: '#ffd23a' },
  mountShard: { name: '탈것 조각', price: 0, c: '#7dff9a' },
};
const MAT_DROPS = {
  normal: [['junk', 0.35, 1, 1], ['ore', 0.08, 1, 1], ['ticket', 0.015, 1, 1], ['mountShard', 0.03, 1, 1]],
  elite: [['junk', 0.6, 1, 2], ['ore', 0.3, 1, 2], ['ticket', 0.1, 1, 1], ['mountShard', 0.3, 1, 2]],
  named: [['ore', 1, 2, 3], ['ticket', 0.3, 1, 1], ['mountShard', 1, 5, 5]],
  boss: [['ore', 1, 3, 5], ['ticket', 0.5, 1, 1], ['mountShard', 1, 5, 10]],
  raid: [['ore', 1, 8, 12], ['ticket', 1, 1, 2], ['mountShard', 1, 20, 20]],
};
export function rollMats(source, rate = 1, rng = Math.random) {
  const out = {};
  for (const [k, p, lo, hi] of MAT_DROPS[source] ?? []) if (rng() < p * rate) out[k] = lo + Math.floor(rng() * (hi - lo + 1));
  return out;
}

// 분해 → 전설 파편 (등급 N~SSS), 파편 교환 NPC에서 전설 장비 확정 제작
export const SHARD_BY_RARITY = [0, 2, 5, 15, 60, 120, 250];
export const LEGEND_CRAFT_COST = 300;

// 강화 (+0 → +10): 확률 · 비용. +5 이상 실패 시 1단계 하락 (보호 주문서로 방지)
export const ENH_MAX = 10;
export const ENH_RATE = [100, 95, 90, 80, 70, 60, 50, 40, 30, 20];
export const enhCost = g => ({ gold: 50 * ((g.enh ?? 0) + 1) * ((g.r ?? 0) + 1), ore: (g.enh ?? 0) + 1 });
export function tryEnhance(g, { protect = false, rng = Math.random } = {}) {
  const e = g.enh ?? 0;
  if (e >= ENH_MAX) return { ok: false, result: 'max' };
  if (rng() * 100 < ENH_RATE[e]) { g.enh = e + 1; return { ok: true, result: 'success' }; }
  if (e >= 5 && !protect) { g.enh = e - 1; return { ok: true, result: 'down' }; }
  return { ok: true, result: protect && e >= 5 ? 'protected' : 'fail' };
}
// 내구도: 사망 시 장착 장비 -10, 0이면 능력치 절반
export const DUR_MAX = 100, DUR_LOSS_ON_DEATH = 10;
export const repairCost = g => Math.ceil((DUR_MAX - (g.dur ?? DUR_MAX)) * (1 + (g.r ?? 0)) * 0.8);

// ---------- 5. 탈것 · 도감 ----------
// weight: 탈것이 나왔을 때 등급 비율(%) · speed: 이동속도 보너스 · frag: 중복 시 환산 조각
export const MOUNT_GRADES = [
  { n: '일반', c: '#c8c8c8', speed: 0.2, weight: 66.2, frag: 5 },
  { n: '고급', c: '#45d96a', speed: 0.4, weight: 26, frag: 10 },
  { n: '희귀', c: '#4a9bff', speed: 0.6, weight: 7, frag: 20 },
  { n: '영웅', c: '#b066ff', speed: 0.8, weight: 0.75, frag: 40 },
  { n: '전설', c: '#ffd23a', speed: 1.0, weight: 0.05, frag: 80, fly: true },
];
// sprite: sprites/mounts.png 칸 번호 (96×72, 바닥 정렬, 오른쪽을 봄) · h: 그림 높이(px) → 안장 높이 계산
const MOUNT_H = [33, 31, 26, 29, 29, 30, 45, 24, 30, 31, 45, 72, 72, 72, 72];
export const MOUNTS = [
  { id: 'brown_horse', name: '갈색말', g: 0 }, { id: 'mule', name: '노새', g: 0 }, { id: 'tamed_wolf', name: '길들인 늑대', g: 0 },
  { id: 'iron_warhorse', name: '철갑 전마', g: 1 }, { id: 'silver_wolf', name: '은빛 늑대', g: 1 }, { id: 'battle_bear', name: '전투 곰', g: 1 },
  { id: 'baby_griffin', name: '아기 그리폰', g: 2 }, { id: 'flame_raptor', name: '화염 랩터', g: 2 }, { id: 'magitech_bike', name: '마공학 바이크', g: 2 },
  { id: 'flame_tiger', name: '화염 백호', g: 3 }, { id: 'shadow_nightmare', name: '그림자 나이트메어', g: 3 }, { id: 'pegasus', name: '페가수스', g: 3 },
  { id: 'ancient_dragon', name: '고대 드래곤', g: 4 }, { id: 'ancient_mecha', name: '고대 메카', g: 4 }, { id: 'phoenix', name: '불사조', g: 4 },
].map((m, i) => ({ ...m, sprite: i, h: MOUNT_H[i] }));
export const mountById = id => MOUNTS.find(m => m.id === id) ?? null;
export const MOUNT_CRAFT_COST = 100;
// 처치 1회당 탈것 획득 확률
export const MOUNT_DROP = { normal: 0.003, elite: 0.02, named: 0.15, boss: 0.1, raid: 0.4 };

// 테스트 스위치: true면 일반 몬스터 처치마다 전설 탈것 1개 확정 (레벨차 패널티 무시). 출시 전 false로
export const TEST = { legendMountFromNormal: true };

/** grade를 주면 해당 등급에서, 없으면 등급 비율대로 뽑음 */
export function rollMount(rng = Math.random, grade = null) {
  const sum = MOUNT_GRADES.reduce((a, g) => a + g.weight, 0);
  let t = rng() * sum;
  if (grade == null) { grade = 0; for (let i = 0; i < MOUNT_GRADES.length; i++) if ((t -= MOUNT_GRADES[i].weight) < 0) { grade = i; break; } }
  const pool = MOUNTS.filter(m => m.g === grade);
  return pool[Math.floor(rng() * pool.length)];
}
/** 탈것 획득: 새로 얻으면 도감 등록, 중복이면 조각으로 환산 */
export function addMount(run, id) {
  const m = mountById(id); if (!m) return null;
  run.mounts ??= []; run.items ??= {};
  if (run.mounts.includes(id)) {
    const n = MOUNT_GRADES[m.g].frag;
    run.items.mountShard = (run.items.mountShard ?? 0) + n;
    return { mount: m, dup: true, shards: n };
  }
  run.mounts.push(id);
  return { mount: m, dup: false };
}
export function craftMount(run, id) {
  const m = mountById(id);
  if (!m) return { ok: false, why: '없는 탈것입니다.' };
  if (run.mounts?.includes(id)) return { ok: false, why: '이미 보유한 탈것입니다.' };
  if ((run.items?.mountShard ?? 0) < MOUNT_CRAFT_COST) return { ok: false, why: `탈것 조각 ${MOUNT_CRAFT_COST}개가 필요합니다.` };
  run.items.mountShard -= MOUNT_CRAFT_COST;
  addMount(run, id);
  return { ok: true, mount: m };
}
// 도감: 보유 1마리당 + 등급 3종 완성 보너스 (영구 가산 스탯)
const CODEX_EACH = [{ hp: 15 }, { atk: 2 }, { def: 2, hp: 20 }, { atk: 5, def: 3 }, { atk: 10, hp: 60 }];
const CODEX_SET = [{ hp: 30 }, { atk: 5 }, { def: 5, hp: 50 }, { atk: 12, def: 6 }, { atk: 25, def: 10, hp: 150 }];
export function codexBonus(owned = []) {
  const out = { hp: 0, mp: 0, atk: 0, def: 0 }, add = b => { for (const k in b) out[k] += b[k]; };
  for (const id of owned) { const m = mountById(id); if (m) add(CODEX_EACH[m.g]); }
  MOUNT_GRADES.forEach((_, g) => { if (MOUNTS.filter(m => m.g === g).every(m => owned.includes(m.id))) add(CODEX_SET[g]); });
  return out;
}
export const codexText = b => Object.entries(b).filter(([, v]) => v).map(([k, v]) => `${STAT_LABEL[k]} +${v}`).join(' · ') || '없음';

// ---------- 창고 ----------
export const STORAGE_MAX = 30;
/** 배열 간 1칸 이동 (가득 차면 실패) */
export function moveItem(from, to, i, max = STORAGE_MAX) {
  if (!from[i] || to.length >= max) return false;
  to.push(from.splice(i, 1)[0]);
  return true;
}
