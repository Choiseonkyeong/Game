# 실제 캐릭터 이미지 연결

`dist/index.html`이 게임의 진입 파일입니다. 아래 경로는 모두 이 HTML을 기준으로 합니다. 캐릭터 위치는 섬 Canvas에서 발밑 중앙 좌표로 배치합니다. 옷장에서는 CSS 이미지 레이어로 표시합니다. 두 렌더러는 `dist/sprite-config.js`의 동일한 설정을 사용합니다.

## 지금 표시되는 이미지

첨부된 완성 캐릭터 JPG를 수정 없이 `dist/images/character-reference.jpg`에 복사했습니다. 이 이미지는 의상과 머리까지 합쳐진 한 장으로, 분리 PNG가 없는 동안 표시됩니다. 흰 배경도 원본 그대로입니다. 배경을 제거하거나 이미지를 레이어별로 자동 분해하지 않았습니다.

**`body.png`를 불러오면 레이어 모드로 자동 전환합니다.** 그때부터 미연결 레이어는 생략하고 안내에 표시합니다. 완성 JPG를 보여 주는 동안에는 코디 선택·저장은 가능하지만 실제 옷 모양은 바뀌지 않습니다. 원본 위에 별도 의상을 억지로 겹치지 않습니다. 새 파일을 넣었다면 새로고침하세요.

## 파일 배치와 순서

| 레이어 | 기본 파일 경로 | z-index | 기존 아이템 ID |
|---|---|---:|---|
| 몸체 | `./images/body.png` | 10 | `body-basic` |
| 헤어 | `./images/hair.png` | 20 | `hair-long` |
| 하의 | `./images/bottom.png` | 30 | `bottom-denim` |
| 상의 | `./images/top.png` | 40 | `top-oat` |
| 오픈형 아우터 | `./images/outer.png` | 50 | `outer-cream` |
| 소품 | `./images/accessory.png` | 60 | `accessory-tote` |
| 모자 | `./images/hat.png` | 70 | `hat-beret` |

아우터와 모자는 기본 코디에서 미착용 상태입니다. 파일을 넣은 후 옷장에서 선택하세요. 코디 저장이 남아 있으면 저장된 아이템이 먼저 표시됩니다. ‘기본 코디로 리셋’으로 위 기본 헤어·하의·상의·소품을 선택할 수 있습니다.

추가 의상은 다음 이름으로 배치합니다. 모든 경로는 `sprite-config.js`에서 수정할 수 있습니다.

```text
dist/
  index.html
  sprite-config.js
  images/
    character-reference.jpg   ← 첨부 원본, 이미 포함
    body.png                 ← 이하 분리 PNG는 직접 배치
    hair.png
    hair-bob.png
    bottom.png
    bottom-skirt.png
    top.png
    top-pink.png
    outer.png
    outer-pink.png
    accessory.png
    accessory-ribbon.png
    hat.png
    hat-ribbon.png
    shop-cloud.png
    shop-rose.png
    shop-sage.png
    shop-ribbon.png
    craft-cotton.png
    craft-moon.png
```

## 내보내기 기준

- 모든 분리 PNG는 **투명 배경, 동일한 전체 캔버스 크기, 동일한 캐릭터 위치**로 내보내세요. 머리나 상의만 바짝 잘라 저장하면 공통 좌표로 겹칠 수 없습니다.
- 현재 기준 프레임은 첨부 원본과 같은 `1230 × 1278`입니다. 다른 기준으로 준비했다면 `frame.width`, `frame.height`를 한 번 수정하세요.
- 렌더러는 이미지 비율을 보존해 프레임 중앙에 맞춥니다. 비율이 다르면 빈 여백이 생깁니다. 비율 보존은 서로 다른 원점의 이미지를 자동 정렬해 주지는 않습니다.
- 몸체는 머리·옷을 제외한 베이스, 헤어는 투명한 얼굴 영역, 아우터는 상의를 드러내는 투명한 앞트임을 가져야 합니다. 등 뒤로 가야 하는 긴 머리까지 정확히 표현하려면 이후 헤어를 앞/뒤 레이어로 추가 분리할 수 있습니다. 현재 순서는 요청한 몸체→헤어→하의→상의→아우터→소품→모자입니다.

## 위치 보정: 한 파일에서 관리

`dist/sprite-config.js`:

```js
frame: { width: 1230, height: 1278 },
layers: {
  body:      { z: 10, x: 0, y: 0, scale: 1 },
  hair:      { z: 20, x: 0, y: 0, scale: 1 },
  bottom:    { z: 30, x: 0, y: 0, scale: 1 },
  top:       { z: 40, x: 0, y: 0, scale: 1 },
  outer:     { z: 50, x: 0, y: 0, scale: 1 },
  accessory: { z: 60, x: 0, y: 0, scale: 1 },
  hat:       { z: 70, x: 0, y: 0, scale: 1 }
},
items: {
  'hair-long': { src: './images/hair.png', x: 12, y: -8, scale: 1.02 }
}
```

`x`, `y`는 기준 프레임의 픽셀 단위입니다. 양수 x는 오른쪽, 양수 y는 아래쪽입니다. `scale`은 좌측 상단 기준 확대 배율입니다. 아이템별 값이 레이어 공통 값을 덮어씁니다. 0과 1이 기본값입니다. 겹침 순서는 `layers`의 z 값을 기준으로 CSS와 Canvas 모두 정렬합니다.

## 실제 적용된 CSS

`dist/style.css` 마지막 부분에 있습니다. JS가 이미지마다 공통 설정을 CSS 변수와 인라인 z-index로 전달합니다. 순서를 바꿀 때에는 CSS와 Canvas가 일치하도록 **config의 z 값을 수정**하세요.

```css
.avatar-stack {
  position: relative;
  width: 100%;
  aspect-ratio: var(--sprite-ratio, 1230 / 1278);
  overflow: hidden;
  isolation: isolate;
}
.avatar-layer {
  position: absolute;
  left: var(--layer-x, 0%);
  top: var(--layer-y, 0%);
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform: scale(var(--layer-scale, 1));
  transform-origin: top left;
  pointer-events: none;
}
.avatar-layer[data-layer=body]      { z-index: 10; }
.avatar-layer[data-layer=hair]      { z-index: 20; }
.avatar-layer[data-layer=bottom]    { z-index: 30; }
.avatar-layer[data-layer=top]       { z-index: 40; }
.avatar-layer[data-layer=outer]     { z-index: 50; }
.avatar-layer[data-layer=accessory] { z-index: 60; }
.avatar-layer[data-layer=hat]       { z-index: 70; }
```

Canvas에서는 같은 프레임에 `drawImage()`로 합성한 뒤 섬 위치에 그립니다. PNG가 로딩될 때, 착용을 바꿀 때, 코디를 불러올 때 합성본을 갱신합니다. 누락 PNG는 마네킹으로 대체하지 않습니다. 원본 JPG 표시 모드와 미연결 레이어는 옷장 안내에 표시합니다. 유니크 의상 PNG가 연결되면 기존 파티클도 유지됩니다.

## 확인

`node tests/sprites.test.cjs`: 경로, CSS 레이어 순서와 z-index, CSS/Canvas 위치·배율 일치, JPG 대체 표시, JPG와 분리 레이어 혼합 방지를 검사합니다. 기존 옷장·경제·부티크·장터 테스트도 유지됩니다. 실제 분리 PNG는 아직 없으므로 완성 리소스의 시각적 정렬은 파일 배치 후 확인해야 합니다.

## 최신 적용: 투명 PNG와 초보자용 시작 키트

기본 완성 캐릭터 경로를 `./images/character.png`로 바꿨습니다. 첨부 원본을 바탕으로 배경 제거 도구가 만든 투명 PNG 파생본입니다. 원본 JPG는 `character-reference.jpg`로 보존했습니다. 위의 ‘흰 배경 JPG 표시’ 설명은 이전 상태입니다. 현재는 투명한 완성 캐릭터로 표시하며, `body.png`를 연결하면 기존 분리 레이어 모드를 사용합니다.

설치 없이 복사해 쓸 수 있는 별도 HTML/CSS/JS 예제는 `avatar-starter/`에 있습니다. `README.md`의 세 단계 안내대로 실행하세요. 이 예제는 PNG 파일을 선택해 새 옷을 겹쳐 볼 수 있습니다. 원본 의상을 완전히 지우는 것은 지원하지 않습니다. 분리 베이스가 준비되면 같은 API로 완전히 교체할 수 있습니다.

## 몸체 분리 없이 덧입히기 (현재 방식)

완성된 투명 캐릭터를 유지하면서 가디건·소품·모자 PNG를 덧입힐 수 있도록 연결했습니다. `sprite-config.js`의 `referenceOverlays`에 허용한 레이어만 완성 캐릭터 위에 표시합니다. 원래 머리·상의·하의를 지우거나 교체하지 않습니다. 아직 새 의상 PNG는 포함되지 않았습니다. 부위별 실제 몸체 PNG가 없어도 이 방식의 렌더링은 사용할 수 있습니다. 기존 분리 몸체 모드도 유지됩니다.
