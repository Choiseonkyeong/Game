# 포근섬 아트 제작 규격 (캐릭터 · 배경 · 소품)

이 문서대로 그림 파일을 만들어 `dist/island/art/`에 넣고 `art/manifest.json`에 등록하면, 코드 수정 없이 게임에 바로 반영됩니다. 파일이 없는 부위는 임시 벡터 그림이 대신 표시됩니다.

목표 화풍: 퍼피레드·메이플스토리처럼 **2.5등신 치비 캐릭터, 굵고 부드러운 외곽선, 밝은 셀 셰이딩(2~3단 명암), 따뜻한 파스텔**. 특정 게임의 캐릭터·옷·로고를 베끼지 않고 포근섬만의 디자인으로 만듭니다(스토어 심사·저작권).

---

## 1. 캐릭터 — 컷아웃(종이인형) 방식

움직임은 엔진이 관절을 돌려서 만듭니다. 그림은 **정지 자세 1장을 부위별로 나눈 것**만 있으면 됩니다(프레임별 그림 불필요).

### 1-1. 캔버스
- 크기: **512×768 px** (엔진 기준 256×384의 2배). 투명 배경 PNG 또는 무손실 WebP.
- 모든 부위 파일이 **같은 캔버스·같은 위치**에 그려져야 합니다. 한 장의 그림에서 레이어별로 내보내면 자동으로 맞습니다.
- 발바닥 선: y = 744 (2배 기준). 캐릭터 키는 발끝~머리끝 약 680 px.
- 기준 이미지: [`docs/art/pogeun-rig-template.png`](art/pogeun-rig-template.png) — 빨간 점이 관절(회전 중심)입니다. 이 위에 덧그리세요.

### 1-2. 시점 3가지
| 시점 | 파일 접미 | 설명 |
|---|---|---|
| 정면 | `front` | 기본 서기·물주기 등 |
| 뒷모습 | `back` | 위쪽으로 걸을 때 |
| 옆모습(오른쪽을 봄) | `side` | 걷기·앉기. 왼쪽은 엔진이 좌우 반전 |

### 1-3. 부위(파트) 목록 — 시점마다 각각
| 파트 이름 | 내용 | 관절(회전 중심, 2배 좌표) |
|---|---|---|
| `head` | 얼굴형·귀(눈코입 제외) | neck (256, 332) |
| `face` | 눈·코·입·볼터치 | 머리와 함께 |
| `hairBack` | 뒷머리(몸 뒤로 가는 부분) | 머리와 함께 |
| `hairFront` | 앞머리·옆머리 | 머리와 함께 |
| `hat` | 모자 | 머리와 함께 |
| `torso` | 몸통(목~허리) | hip (256, 524) |
| `pelvis` | 골반/치마 윗부분 | hip |
| `upperArmL` / `upperArmR` | 위팔 | shoulderL (196, 352) / shoulderR (316, 352) |
| `foreArmL` / `foreArmR` | 아래팔 + 손 | elbowL (184, 444) / elbowR (328, 444) |
| `thighL` / `thighR` | 허벅지 | thighL (228, 536) / thighR (284, 536) |
| `shinL` / `shinR` | 정강이 + 발 | kneeL (224, 628) / kneeR (288, 628) |

- 옆모습 관절 좌표는 템플릿의 `side` 칸을 따릅니다.
- **관절이 겹치는 부분은 1~2mm 겹쳐 그리기**(팔꿈치·무릎을 둥글게). 돌아갈 때 틈이 보이지 않습니다.
- L = 화면 왼쪽, R = 화면 오른쪽(정면 기준).

### 1-4. 옷·머리는 "층(레이어)" 단위
같은 파트 이름을 쓰되 층별 폴더에 넣습니다. 엔진이 아래→위 순서로 겹칩니다.

| 층 | 덮는 파트 | 변형 이름(현재 게임 데이터) |
|---|---|---|
| `body` (피부) | head, torso, pelvis, 팔다리 전부 | `cream`, `honey`, `cocoa` |
| `bottom` | pelvis, thigh, (긴바지면 shin) | `shorts`, `skirt`, `trousers`, `pleats` |
| `shoes` | shin(발 부분만) | `cream`, `brown`, `pink`, `sage` |
| `top` | torso, upperArm, (긴소매면 foreArm) | `sailor`, `cardigan`, `tee`, `hoodie`, `blouse`, `overall` |
| `accessory` | torso / head | `bag`, `scarf`, `glasses` |
| `face` | face | 피부 이름과 동일(`cream` 등) |
| `hairBack`, `hairFront` | 같은 이름 파트 | `머리모양-머리색` 예: `bob-chestnut`, `twin-caramel` |
| `hat` | hat | `straw`, `beret`, `bow` |

옷 파트는 **옷 부분만** 그리고 나머지는 투명. 피부층 위에 그대로 얹힙니다.

### 1-5. 파일 이름과 등록
```
dist/island/art/char/<층>/<변형>/<시점>-<파트>.webp
예) art/char/top/sailor/front-torso.webp
    art/char/body/cream/side-shinR.webp
```
`dist/island/art/manifest.json`:
```json
{
  "body":  { "cream":  { "front": { "head": "char/body/cream/front-head.webp", "torso": "char/body/cream/front-torso.webp" } } },
  "top":   { "sailor": { "front": { "torso": "char/top/sailor/front-torso.webp", "upperArmL": "char/top/sailor/front-upperArmL.webp" } } },
  "hairFront": { "bob-chestnut": { "front": { "hairFront": "char/hairFront/bob-chestnut/front-hairFront.webp" } } }
}
```
일부만 등록해도 됩니다. 등록 안 된 파트는 임시 그림으로 표시됩니다.

### 1-6. 첫 납품 최소 세트 (이것만 있으면 기본 캐릭터 완성)
- `body/cream` 3시점 × 11파트 = 33장
- `face/cream` 2시점(front, side) = 2장
- `hairBack`,`hairFront` `bob-chestnut` 3시점 = 6장
- `top/sailor` 3시점 × 5파트 = 15장, `bottom/skirt` 3시점 × 3파트 = 9장, `shoes/brown` 3시점 × 2파트 = 6장

→ 총 71장. 한 시점 그림을 레이어로 그린 뒤 내보내면 시점당 PSD 1개입니다.

### 1-7. 이미지 생성 도구로 만들 때 프롬프트 예시
> chibi game character, 2.5 head-to-body ratio, cute korean casual style, soft thick outline, cel shading with 2 tones, warm pastel colors, full body, standing straight, arms slightly away from body, legs slightly apart, **front view / back view / right side view**, plain white background, consistent proportions, original character design, no text

생성 후 템플릿 위에 맞춰 크기·위치를 정렬하고 파트별로 잘라 내보냅니다. 같은 캐릭터 3시점이 일관되도록 정면 그림을 먼저 확정한 뒤 나머지 시점을 그 그림 기준으로 만듭니다.

---

## 2. 배경(섬)
| 파일 | 크기 | 내용 |
|---|---|---|
| `art/world/island-day.webp` | 1920×1600 | 아이소메트릭 섬 전체(바다·모래·잔디), 소품 없음 |
| `art/world/island-sunset.webp` | 1920×1600 | 같은 구도 노을 버전 |
| `art/world/sea-tile.webp` | 512×512 | 끊김 없이 반복되는 물결(선택) |

- 시점: 2:1 아이소메트릭(타일 마름모 가로 84 : 세로 44 비율, 현재 9×9 격자). 게임 좌표 (480,220)이 격자 맨 위 칸 중심, 1칸 = 가로 42·세로 22 이동(1920 폭 기준 2배).
- 가장자리 바다는 화면 밖까지 이어지도록 넉넉히.

## 3. 소품(가구·식물·동물)
- 각 소품 1장, **바닥 접점이 그림 아래 중앙**, 투명 배경, 높이 256~512 px.
- 이름: `art/props/<kind>.webp` — `house, bench, pot, tree, bowl, pond, table, cushion, lamp, path, fence, daisy, tulip, lavender` (+ 성장단계 `daisy-sprout` 등).
- 고양이 모모: `art/pet/momo-<view>-<pose>.webp` (`front|side`, `idle|walk1|walk2|sleep`), 256×256.

## 4. UI
- 앱 아이콘: 512×512 PNG(스토어), 192/512 maskable(모서리 여백 20%).
- 스토어 그래픽: 1024×500 대표 이미지, 휴대폰 스크린샷 1080×1920 이상 2~8장.

## 5. 검수 체크
- [ ] 같은 시점의 모든 파트를 겹쳤을 때 한 장의 그림과 똑같이 보인다.
- [ ] 관절 점에서 돌려도(±30°) 틈·끊김이 없다.
- [ ] 옷층을 다른 피부층 위에 얹어도 어긋나지 않는다.
- [ ] 외곽선 두께·명암 방향(왼쪽 위 광원)이 모든 파일에서 같다.
- [ ] 다른 게임의 캐릭터·로고·고유 의상을 사용하지 않았다.
