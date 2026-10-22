# 포근섬 임시 밸런스 데이터와 편집 도구

게임 루프 작업 브랜치의 설정 원본은 `dist/island/balance.json`입니다. `schemaVersion: 1`, `provisional: true`로 임시값임을 표시합니다. UI 레이아웃·원화·플레이어 저장 파일은 수정하지 않습니다.

| 데이터 | 경로 예시 | 단위/의미 |
| --- | --- | --- |
| 먹이 가격 | `feed.feed.price`, `feed.milk.price` | 조개 |
| 동물 가격 | `animals.hen.price` | 조개 |
| 성장 단계 | `animals.hen.stages` | 5~7단계 |
| 소화·생산 시간 | `animals.hen.ms` | 밀리초 |
| 생산물·보상 | `animals.hen.product`, `animals.hen.shells` | 이름·조개 |
| 씨앗 가격·시간·수확 | `seeds.apple.price`, `.ms`, `.reward` | 조개·밀리초·조개 |
| 가구·옷 가격 | `furniture.lamp`, `clothing.trench-set` | 조개 |
| 첫 수확 레벨 | `progression.firstHarvestLevel` | 기본 2 |
| 가축 해금 레벨 | `progression.livestockUnlockLevel` | 기본 4 |
| 섬 확대 배율 | `progression.axisGrowth` | 각 축 최소 배율, 기본 1.12 |
| 섬 확장 비용 | `progression.expandCosts.2` | Lv2 → Lv3 비용 |
| 새 섬 비용 | `progression.islandCosts.1` | 두 번째 섬 비용 |

저장소 루트에서 실행합니다. 별도 패키지 설치 없이 Node.js 22 이상을 사용합니다.

```sh
node tools/pogeun-balance.mjs validate
node tools/pogeun-balance.mjs show
node tools/pogeun-balance.mjs set feed.feed.price 4
node tools/pogeun-balance.mjs set animals.hen.ms 45000
node tools/pogeun-balance.mjs set animals.hen.stages 6
node tools/pogeun-balance.mjs export /tmp/pogeun-balance.json
```

문자열은 JSON 문자열로 전달합니다: `node tools/pogeun-balance.mjs set animals.hen.product '"달걀"'`.

`set`은 기존 값 하나만 수정합니다. 스키마 검증을 통과한 뒤 파일을 교체하며, 실패하면 원본을 유지합니다. `export`는 기존 파일을 덮어쓰지 않습니다. `--file 경로`를 명령 앞에 지정하면 별도 사본을 편집할 수 있습니다.

검증과 게임 로딩은 동일한 `balance-schema.js`를 사용합니다. 설정 변경을 실제 서비스에 반영하려면 소스 저장·검사·배포가 필요합니다. 로컬 편집으로 현재 배포본이나 사용자 저장 데이터를 변경하지 않습니다. 배포 시 설정과 의존 모듈의 버전 URL·서비스워커 캐시 버전도 함께 갱신하세요.

현재 동물 성장과 생산은 같은 `ms`를 사용합니다. 먹이를 처음 주고 소화한 뒤 다시 먹이면 성장하고, 성체는 먹이를 먹은 뒤 생산물을 준비합니다. 새 동물·의상 ID를 추가하려면 스키마와 대응하는 이미지·동작도 구현해야 합니다.
