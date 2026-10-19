# 포근섬 생활 업데이트 — 구현/아트 기록

최신 기본 게임은 `island.js?v=6`다. 기존 정원 저장(`suming-cozy-island-v1`)은 보존한다.

## 렌더링과 코디

이전 걷기 코드는 매 프레임 `person.innerHTML`을 교체하고 중첩 SVG 이미지를 다시 만들었다. 지금은 원본 남녀 얼굴/머리 그림을 한 번 디코드/크로마키 처리한 뒤 지속되는 128×192 Canvas에 그린다. `dom-render.js`는 같은 SVG 이미지/Canvas 노드를 유지한다. requestAnimationFrame으로 위치를 보간하고 이동 거리당 110 world units/second를 사용한다. 목표를 바꿔도 현재 화면 위치에서 이어 걷는다.

남녀 머리 렌더 영역은 동일한 86×72다. 기존 얼굴·머리색·헤어 실루엣을 사용하며, 몸과 의복은 따뜻한 파스텔/갈색 외곽선/2단 셀 명암의 Canvas 컷아웃으로 분리한다. 캐릭터 전체 스프라이트를 교체하지 않고 팔·다리 관절과 같은 좌표에 상하의/신발/가방/악세서리를 그린다. 512×768 외부 아트 제작 규격과 기존 rig.js의 원본 파트는 보존한다. 새 런타임은 128×192 캔버스에 합성하는 전용 구현으로, 새 옷이 모두 512×768 파일로 납품되었다고 표현하지 않는다.

`wardrobe.js`: 남자 하늘 반팔/반바지, 여자 분홍 반팔/반바지. 상의10/하의6/신발6/가방4/모자5/악세서리5. 남녀별 코디를 `pogeun-wardrobe-v2`에 저장한다. 아이템과 저장 코디 선택은 현재 성별을 바꾸지 않는다. 헤어·미용실은 향후 기능으로 이번에는 노출하지 않는다.

## 동물

상어/고래2색/돌고래는 바다 순환 경로만 사용하고 물결 아래 몸을 가려 빼꼼 보인다. 물개/물거북 등은 물과 동쪽 해변 사이를 왕복한다. 육지거북은 일반 육지 동물이다. 바다 친구는 간헐적으로 물고기를 해변에 던지고, 물고기를 누르면 `pogeun-fish-v1` 보관 수가 증가한다. 물고기는 섬 수첩에서 확인한다. 육지 방문 동물은 기존 가구 회피 경로를 사용한다. 해변 상륙 연출은 물가와 해변 간 위치 보간이며 육지 방문자의 가구 회피 경로와 별도다.

## 집과 방

`art/props/house-front.webp`: imagegen 제작, 정면의 투박하고 둥근 초록 지붕 오두막, 투명 배경.
`art/world/island-cozy.webp`: imagegen 제작, 따뜻한 픽셀 잔디/해변/청록 바다.
`art/world/cottage-room.webp`: imagegen 제작, 침대와 러그가 있는 기본 방.
세 이미지 모두 기본 내장 imagegen 도구를 사용했다. 프로젝트용 WebP로 크기 최적화했다.

프롬프트: Original Pogeun Island cozy 16-bit JRPG pixel art, soft thick brown outlines, warm pastel sage/cream/teal palette, 2–3 tone cel shading. House: one rustic front elevation cottage, centered wooden door, round windows, true transparency. Island: empty walkable grass/sand island and calm sea, no furniture/characters. Room: front view cottage interior, wood floor, left bed, central pink rug, empty floor, no characters/UI.

집 문을 누르면 실내로 들어간다. 방바닥을 눌러 걷고 침대를 누르면 곁에서 쉰다. 아래 문/산책 메뉴로 나간다. 침대와 러그는 배경에 포함된 고정 기본 가구다. 이동/구매하는 방 꾸미기와 미용실은 아직 구현하지 않았다. 기존 야외 가구 그림은 보존하며 이번에 모든 기존 그림을 재제작하지 않았다.

## 검수 구분

자동 검사와 모바일 크기 데스크톱 Chromium의 실제 동작 검사를 수행한다. 실제 iPhone Safari/카카오 인앱에서의 깜빡임 및 터치 품질은 별도 확인이 필요하다. 기기에서 재현되지 않았다고 단정하지 않는다.
