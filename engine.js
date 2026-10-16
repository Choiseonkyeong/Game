export const levels = [
  { title: '구름 뒤에 숨은 오후', subtitle: '젖은 고양이를 뽀송하게 만들어 주세요.', label: '카페 앞', steps: 2,
    hints: ['하늘을 가린 구름도 움직일 수 있을까요?', '구름을 오른쪽 햇살 자리로 옮겨 보세요.', '비가 그쳤다면, 수건을 고양이에게 가져다 주세요.'] },
  { title: '커피 한 잔의 비밀', subtitle: '잠든 카페를 깨워 커피 한 잔을 내려 주세요.', label: '카페 안', steps: 3,
    hints: ['커피 머신에 전기가 들어오나요?', '벽의 스위치를 켜고, 빈 컵을 머신에 놓아 보세요.', '컵이 준비되면 머신의 동그란 버튼을 눌러 주세요.'] },
  { title: '퇴근은 고양이의 허락부터', subtitle: '열쇠를 찾아 카페 문을 열어 주세요.', label: '카페의 밤', steps: 3,
    hints: ['쿠션 아래에 뭔가 숨겨져 있어요. 바닥으로 옮겨 볼까요?', '열쇠를 지키는 고양이에게 생선을 양보해 보세요.', '생선을 밥그릇에 놓은 다음, 열쇠를 문에 가져가세요.'] }
];
export function initial(level = 0) { return {level, sun: false, dry: false, power: false, cup: false, coffee: false, cushion: false, fed: false, door: false}; }
export function progress(s) { return s.level === 0 ? +s.sun + +s.dry : s.level === 1 ? +s.power + +s.cup + +s.coffee : +s.cushion + +s.fed + +s.door; }
export function complete(s) { return progress(s) === levels[s.level].steps; }
export function act(s, item, target = item) {
  const n = {...s}; let message = '조금 다른 곳에 사용해 볼까요?';
  if (complete(s)) return {state: n, changed: false, message: '이미 해결한 장면이에요.'};
  if (s.level === 0) {
    if (item === 'cloud' && target === 'sun' && !s.sun) { n.sun = true; message = '구름이 걷히고 햇살이 찾아왔어요!'; }
    if (item === 'towel' && target === 'cat' && !s.dry) { if (s.sun) {n.dry = true; message = '뽀송뽀송! 고양이도 기분이 좋아졌어요.';} else message = '아직 비가 와요. 먼저 비를 그치게 해 주세요.'; }
  }
  if (s.level === 1) {
    if (item === 'switch' && !s.power) {n.power = true; message = '딸깍! 커피 머신이 깨어났어요.';}
    if (item === 'mug' && target === 'machine' && !s.cup) { if (s.power) {n.cup = true; message = '컵 준비 완료! 이제 커피를 내려 볼까요?';} else message = '머신이 꺼져 있어요. 전원부터 찾아봐요.'; }
    if (item === 'brew' && !s.coffee) { if (s.power && s.cup) { n.coffee = true; message = '향긋한 커피 완성! 오늘도 잘 부탁해요.'; } else message = s.power ? '커피를 받을 컵이 필요해요.' : '먼저 전원을 켜 주세요.'; }
  }
  if (s.level === 2) {
    if (item === 'cushion' && target === 'rug' && !s.cushion) {n.cushion = true; message = '여기 있었네! 그런데 고양이가 열쇠를 지켜요.';}
    if (item === 'fish' && target === 'bowl' && !s.fed) {n.fed = true; message = '냠냠! 고양이가 밥그릇으로 자리를 옮겼어요.';}
    if (item === 'key' && target === 'door' && s.cushion && !s.door) {if (s.fed) {n.door = true; message = '찰칵! 오늘의 카페 영업을 마쳤어요.';} else message = '고양이가 열쇠 위에 앉아 있어요. 관심을 돌려 볼까요?';}
  }
  return {state: n, changed: progress(n) !== progress(s), message};
}

export function restore(level, saved) {
  let state = initial(level);
  if (!saved || typeof saved !== 'object') return state;
  const routes = [ [['sun','cloud','sun'],['dry','towel','cat']], [['power','switch'],['cup','mug','machine'],['coffee','brew']], [['cushion','cushion','rug'],['fed','fish','bowl'],['door','key','door']] ];
  for (const [flag,item,target] of routes[level]) if(saved[flag] === true) state=act(state,item,target).state;
  return state;
}
