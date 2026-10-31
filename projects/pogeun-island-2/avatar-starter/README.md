# 포근섬 캐릭터 시작 키트

1. ZIP을 풀어 주세요.
2. `index.html`을 크롬이나 엣지로 열어 주세요.
3. 캐릭터를 누르면 옷장이 열려요. 설치나 명령어 입력은 필요 없어요.

```text
avatar-starter/
├── index.html          게임 화면과 옷장
├── style.css           레이어 순서와 배치
├── avatar.js           이미지 불러오기와 착용 코드
└── images/
    └── character.png   투명 배경 캐릭터 · 이미 포함
```

`character.png`는 첨부 그림을 바탕으로 배경 제거 도구가 만든 투명 PNG 파생본이에요. 수정 전 원본 JPG는 전체 게임의 `dist/images/character-reference.jpg`에 보관했어요.

## 옷 입혀 보기

옷장 → 종류 선택 → ‘의상 PNG 선택’에서 준비한 투명 PNG를 고르세요. 게임과 미리보기에 동시에 반영돼요. 서버로 업로드하지 않고 브라우저에서 읽으며, 선택 결과는 새로고침하면 초기화돼요. 전체 포근섬 게임의 코디 저장은 기존 기능을 그대로 사용해요.

**원본에 그려진 흰 티와 반바지는 이미지의 일부라 그대로 남아요.** 지금은 새 옷을 위에 겹쳐 입혀요. 작거나 짧은 옷을 겹치면 원래 옷이 보일 수 있어요. 완전한 교체는 추후 옷 없는 베이스와 별도 의상이 필요해요.

## 파일로 의상 연결하기

`images` 폴더에 `top.png` 등을 넣고 `avatar.js` 맨 위 설정만 바꾸세요.

```js
const AVATAR = {
  width: 1230, height: 1278,
  base: './images/character.png',
  layers: {
    hair: null, bottom: null,
    top: './images/top.png',
    outer: null, accessory: null, hat: null
  },
  offsets: {}
};
```

`null`은 해당 레이어를 사용하지 않는다는 뜻이에요. 완전한 분리 이미지가 준비되면 `base`를 `./images/body.png`로 바꾸고 헤어·하의·상의도 연결하세요.

모든 PNG는 **같은 1230×1278 캔버스, 같은 캐릭터 위치, 투명 배경**으로 준비하세요. 의상만 바짝 자르지 마세요.

조금 어긋나면 `offsets`에 보정 값을 적으세요. x 양수는 오른쪽, y 양수는 아래쪽이며 기준 프레임의 픽셀 단위예요.

```js
offsets: { top: { x: 8, y: -4, scale: 1 } }
```

## CSS 순서

몸체 10 → 헤어 20 → 하의 30 → 상의 40 → 아우터 50 → 소품 60 → 모자 70 순서로 겹쳐요. 실제 코드는 `style.css`에 있어요.

```css
.avatar-stack { position: relative; aspect-ratio: 1230 / 1278; }
.avatar-layer {
  position: absolute;
  width: 100%; height: 100%;
  object-fit: contain;
  left: var(--x, 0%); top: var(--y, 0%);
  transform: scale(var(--scale, 1));
  transform-origin: top left;
}
.avatar-layer[data-slot=body] { z-index: 10; }
.avatar-layer[data-slot=hair] { z-index: 20; }
.avatar-layer[data-slot=bottom] { z-index: 30; }
.avatar-layer[data-slot=top] { z-index: 40; }
.avatar-layer[data-slot=outer] { z-index: 50; }
.avatar-layer[data-slot=accessory] { z-index: 60; }
.avatar-layer[data-slot=hat] { z-index: 70; }
```

## 상점·옷장 연결 코드

```js
await avatar.load('top', './images/top.png'); // 새 옷 입기
avatar.remove('hat');                        // 모자 벗기
avatar.reset();                             // 설정된 기본 모습
```

Canvas 게임에도 사용할 수 있어요. 기존 게임의 그리기 함수에서 호출하세요.

```js
avatar.draw(ctx, 400, 300, 120); // 발밑 x=400, y=300, 표시 폭=120
```

전체 포근섬 게임은 구매·제작 의상과 옷장이 이미 연결돼 있어요. 시작 키트는 캐릭터 코드만 다른 곳에 복사하고 싶을 때 사용하세요.

파일을 찾지 못하면 `images/character.png`의 폴더 이름·대소문자를 확인하세요. HTML과 images 폴더를 함께 복사해야 해요. 실제 브라우저 시각 검증은 미실시예요.
