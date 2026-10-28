# 포근섬 홈 확대 / 기본 사과나무 변경 코드

기준: master ed1bae6adbe3e1a32ce1e9ad4cffd9baffc5a81a (v51 게임 내용)
로컬 작업: codex/island-sapling-stage52. 사용자 승인 후 v52 배포 완료: https://choiseonkyeong.github.io/Game/island/?v=52 (source f2d4cdadc928cfe6508faaad377f01c7cfb7e624).

아래 코드가 현재 작업본에 반영되어 있습니다. 기존 Game 저장소의 dist/island를 기준으로 적용하며, 전체 게임 코드를 대체하지 않습니다.

## HTML — dist/island/index.html
기존 CSS 링크 뒤에 추가하고, 기존 module의 버전을 52로 변경합니다. scene 내부의 기존 world/zoom/walk-label은 그대로 둡니다.

```html
<link rel="stylesheet" href="home52.css?v=52">
<section id="scene" class="home-stage" aria-label="나의 섬">
  <!-- 기존 SVG와 확대/축소 버튼 유지 -->
</section>
<script type="module" src="island.js?v=52"></script>
```

## CSS — 새 파일 dist/island/home52.css

```css
/* Home only; dialogs and fitting-room aspect ratios keep their own layout. */
html,body{width:100%;height:100%;margin:0;padding:0}
#game{width:100%;max-width:none;height:100vh;height:100dvh;margin:0;padding:0}
#scene{position:absolute;inset:0 0 76px;min-width:0;min-height:0;padding:0;overflow:hidden}
#world{display:block;width:100%;height:100%}
#walk-label{bottom:6px}
@media(orientation:landscape) and (max-height:500px){
 #scene{bottom:calc(62px + env(safe-area-inset-bottom))}
 #context{left:max(8px,env(safe-area-inset-left));transform:none;width:36vw;max-width:340px;bottom:calc(68px + env(safe-area-inset-bottom))!important}
 #context .text small{line-height:1.35}
 #toast{top:76px!important;max-width:50vw;font-size:11px}
 .zoom{bottom:6px!important}
}
```

## JS — 새 파일 dist/island/home-camera.js

```js
// Fit the actual painted island, rather than the tall sky-background image.
export function homeViewBox(width,height,{zoom=1,stage=null,inside=false}={}){
 const aspect=Math.max(1,width)/Math.max(1,height);
 if(inside){const w=Math.max(960,800*aspect)/zoom;return[480-w/2,400-w/aspect/2,w,w/aspect];}
 const expansion=stage?.compactReference?(stage.expansion||1):1;
 const bounds=stage&&!stage.reference&&!stage.compactReference
  ?{x:stage.x,y:stage.y,width:stage.width,height:stage.height}
  :{x:480+(225-480)*expansion,y:430+(185-430)*expansion,width:490*expansion,height:465*expansion};
 const h=Math.max(bounds.height/.90,bounds.width/(aspect*.88))/zoom,w=h*aspect;
 return[bounds.x+bounds.width/2-w/2,bounds.y+bounds.height/2-h/2,w,h];
}
```

## JS — dist/island/island.js
기존 camera()를 교체합니다. 기존 ResizeObserver(camera), 클릭 좌표의 SVG 변환, zoom 버튼은 그대로 사용합니다.

```js
import { homeViewBox } from './home-camera.js?v=52';
import { starterTreeArt, starterPlant, starterSproutCover } from './starter-tree-art.js?v=52'; // 기존 import 교체

function camera() {
  const scene = $('scene');
  $('world').setAttribute('viewBox', homeViewBox(
    scene.clientWidth, scene.clientHeight,
    { zoom, stage: stage(), inside: room.inside }
  ).join(' '));
}
```

render()의 room.inside 분기는 `camera();room.render();context();return;` 순서로 처리합니다.

itemArt(p)와 클릭 라벨의 기본 나무 판별은 `starterPlant(state,p)`를 사용합니다. 이 함수는 좌표 대신 starterId로 확인하여 Lv2 확장·저장 복원 후에도 같은 나무를 유지합니다. starterTreeArt(p)가 실제 작물을 그립니다. 별도의 클릭 이벤트를 중복 등록하지 않습니다. 기존 data-id → pick() → selected → context() → 물 주기/수확 트랜잭션을 그대로 이용합니다.

starter의 기존 object-hit rect에는 다음 속성을 추가했습니다. 현재 파일에 통합된 정확한 코드를 참고하세요.

```js
// 렌더 템플릿의 rect 속성에 삽입:
// starterPlant(state,p)일 때만 사용
// data-id는 기존 p.id 그대로 유지
const attributes = `data-crop="starter-apple" data-growth-stage="${seedStage(p)}"`;
const label = `기본 사과나무 · ${seedStage(p)}/5단계 · 성장 상태`;
```

## SVG — dist/island/starter-tree-art.js
현재 파일에 stage1 묘목과 ID 판별/배경 새싹 덮개가 포함되어 있습니다. 기존 모듈을 이 수정본으로 교체하세요.

```js
import {seedStage} from './seed-shop.js?v=42';

// Identity survives terrain expansion, relocation and restoring an existing save.
export const starterPlant=(state,plant)=>plant?.seedKind==='apple'&&plant.id===state.loop.starterId;

// Remove the decorative baked sprout at the original artwork position, independently
// of the live crop's current location. Never creates or resets a saved plant.
export function starterSproutCover(scene,grid){
 if(!scene?.reference||!grid)return '';
 const f=scene.expansion||1,x=grid.ox+6*grid.hx,y=grid.oy+22*grid.hy,k=Math.max(.7,grid.hx/42);
 return `<g id="starter-sprout-cover" transform="translate(480 430) scale(${f}) translate(-480 -430)"><g transform="translate(${x} ${y}) scale(${k})" pointer-events="none"><defs><radialGradient id="starter-lawn"><stop offset=".72" stop-color="#97c866"/><stop offset="1" stop-color="#97c866" stop-opacity="0"/></radialGradient></defs><ellipse cx="7" cy="-33" rx="43" ry="51" fill="url(#starter-lawn)"/></g></g>`;
}

// Draw the live crop at its saved logical cell; purchased crops keep their art.
export function starterTreeArt(plant, now = Date.now()) {
  const stage = seedStage(plant, now);
  if (stage === 1) return `<g class="starter-tree starter-sapling" data-growth-stage="1" stroke="#806b54" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">
    <title>기본 사과나무 묘목 · 1단계</title>
    <g transform="translate(7 -4) scale(1.15)">
    <ellipse cy="1" rx="24" ry="7" fill="#749452" opacity=".23" stroke="none"/>
    <ellipse cy="-1" rx="16" ry="5" fill="#d4b48b" stroke="#ad8d69"/>
    <path d="M-3-2Q0-18-2-37L4-39Q7-20 4-2Z" fill="#ba9570"/>
    <path d="M1-23Q-23-18-25-38Q-7-44 1-23Z" fill="#b8d898"/>
    <path d="M3-30Q5-51 25-45Q26-27 3-30Z" fill="#c6dfab"/>
    <path d="M0-24L-16-33M5-32L18-40" fill="none" stroke="#8fa66c" stroke-width="1.1"/>
    <path d="M-7-3L-12-7M10-3L15-7" stroke="#b9d49b"/>
    </g>
  </g>`;
  const height = [0, 0, 48, 68, 83, 83][stage];
  const crown = stage === 2 ? 20 : stage === 3 ? 29 : 36;
  const foliage = (x, y, radius) => `<g transform="translate(${x} ${y})">
    <path d="M${-radius} 3q-8-10 0-17q-1-12 12-12q8-13 19-4q15-3 17 11q12 6 4 19q-4 13-20 9q-18 8-32-6Z" fill="#8bbb62" stroke="#5f834c" stroke-width="1.6"/>
    <path d="M${-radius+4}-8q0-10 12-9q10-11 18-3q10-2 11 6" fill="none" stroke="#badb82" stroke-width="5" stroke-linecap="round"/>
    <path d="M${-radius+5} 3q12 8 24 1q12 3 19-4" fill="none" stroke="#729f55" stroke-width="4" stroke-linecap="round"/>
  </g>`;
  const apple = (x,y) => `<g transform="translate(${x} ${y})"><path d="M0-4q-6-5-9 1q-2 8 5 11q4-1 7 0q7-5 4-11q-3-4-7-1Z" fill="#e78d7e" stroke="#a56f57" stroke-width="1.2"/><path d="M0-4l2-5" stroke="#7f8050" stroke-width="1.5"/><path d="M3-8q5-4 6 0q-3 3-6 0" fill="#a4bf6d"/><path d="M-5-1l-1 3" stroke="#f9c8ac" stroke-width="2" stroke-linecap="round"/></g>`;
  const fruit = stage === 5 ? [[-19,-height-6],[10,-height-17],[27,-height+2],[-5,-height+9]].map(([x,y])=>apple(x,y)).join('') : '';
  const buds = stage === 4 ? [[-19,-height-6],[10,-height-17],[24,-height+2]].map(([x,y])=>`<g transform="translate(${x} ${y})" fill="#f5d6c6" stroke="#c49b89" stroke-width=".7"><circle cx="-2" r="3"/><circle cx="2" r="3"/><circle cy="-3" r="3"/><circle cy="3" r="3"/><circle r="1.8" fill="#e5c66f"/></g>`).join('') : '';
  return `<g class="starter-tree" data-growth-stage="${stage}" stroke-linejoin="round">
    <ellipse cy="1" rx="31" ry="8" fill="#64894e" opacity=".18"/>
    <path d="M-6 0q6-${height/2} 1-${height}h10q-6 ${height/2} 0 ${height}l-9-4Z" fill="#bd9569" stroke="#876e4f" stroke-width="1.7"/>
    <path d="M5-14l-16-22M8-24l16-15" fill="none" stroke="#a9855c" stroke-width="4" stroke-linecap="round"/>
    ${foliage(0,-27,17)}${foliage(-5,-height,crown)}${stage>=3?foliage(12,-height+9,crown-7):''}${buds}${fruit}
    <path d="M-10 0q7-7 15-3q9-3 14 3" fill="none" stroke="#a9cb78" stroke-width="2"/>
  </g>`;
}
```

render()의 배경 이미지 바로 뒤에서 `${starterSproutCover(st,terrainData.grid)}`를 출력합니다. 배경 덮개는 원화의 고정 위치에, 실제 작물은 현재 저장 좌표에 그려져 수확·확장 후 새싹이 중복되지 않습니다. 새 작물을 만들거나 기존 성장 시간을 초기화하지 않습니다.

## 넓은 화면의 배경 가장자리
통합된 island.js의 SVG defs에는 home-edge/home-edge-mask를 추가했고, reference 배경 image에만 이 마스크를 연결했습니다. 마스크 좌표는 userSpaceOnUse로 명시하며, 바깥 배경 그라데이션은 원화 가장자리에서 추출한 색으로 연결했습니다. 배경 이미지가 끝나는 지점을 부드럽게 처리하며 집·섬·오브젝트 중앙은 보존합니다.

## 오프라인 앱 캐시
sw.js CACHE를 pogeun-island-52로 올리고 CORE에 home52.css?v=52, home-camera.js?v=52를 등록했습니다. island.js 및 starter-tree-art.js의 참조도 v52입니다. 기존 오프라인 fallback 동작을 유지합니다.

검증: 148개 자동 검사 통과. 물 주기→수확(+150조개)→Lv2 좌표 재배치→재접속 후 동일 기본 나무1개·보상/성장 유지 확인. Chrome 데스크톱과 844×390 iframe 렌더, 사과나무 클릭→성장 단계/물 주기 메뉴 확인. 카메라의 가로 비율, 섬 전체 포함, 줌/실내 좌표 검사 포함. 실제 아이폰 터치 미검수.
