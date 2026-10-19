# 포근섬 v7 — 공중섬·캐릭터·서울 날씨

## 이번 변경의 기준

원본 master `39f5b4fea3c09df86ace2748f8d999a6b9e9a533`에서 `codex/island-sky`로 분리했다. 이전 작업 worktree는 보존했다. 사용자 요청은 조개 재화 확정, 여자 검정 생머리, 얼굴과 몸이 따로 놀지 않는 화풍, 자연스러운 이동, 푸른 하늘과 아래 바다가 있는 공중섬, 서울 실제 날씨 연동이다. 기존 정원·옷장·꽃·진행 저장과 다른 게임은 보존한다.

## 캐릭터 아트/옷장

- `art/humans/female-cozy.webp`, `male-cozy.webp`: 완성된 전신 그림으로 교체. 각768×768, 4방향×6프레임, 각 프레임128×192. 여자 검정 긴 생머리·분홍 반팔·청반바지, 남자 하늘 반팔·청반바지. 기존 남녀 얼굴을 참조해 내장 imagegen으로 제작했다.
- 여자 첫 후보는 최종 납품에 사용하지 않고 남자와 머리/몸 비율을 다시 맞춘 후보를 사용했다. 정면 비교 그림은 QA에 남긴다. ‘두 머리가 픽셀 단위로 동일하다’고 주장하지 않는다.
- `human-sprites.js`: 기존의 기하학적 팔다리 위에 얼굴만 붙이던 구현을 제거했다. 새 전신 비트맵을 유지하고 의복 마스크/명암과 소품을 합성한다. 남녀별 코디 저장을 유지한다. 미리보기는 짧은 iPhone 화면에서도 발이 탭 위로 넘치지 않게 맞췄다.
- 셀 명암을 유지하는 의상 색상, 나그랑 배색·줄무늬·후드 포켓·가디건·치마/긴바지·신발/부츠/샌들·가방 끈·둥근 리본을 적용한다. 33착용 아이템+3착용해제 선택지다. 각 옷마다 새512×768 파트71장을 납품한 것은 아니다. 기존512×768 컷아웃 규격과 rig 자산은 남겨 두었다. 개별 옷의 완전한 독립 원화와 미용실은 향후 작업이다.
- 앉기는 같은 그림의 하체를 hip/knee에서 접고, 몸/머리/옷을 유지한 채 앉고 일어서는 전환을 한다. 물주기는 손의 방향에 물뿌리개와 물방울을 맞춘다. 모든 포즈가 별도 원화 애니메이션으로 완성된 것은 아니다.

## 이동/깜빡임

`movement.js`: 좌표 투영과 역투영을 분리하고 바닥 충돌을 샘플링한다. 빈 잔디는 직선으로 걸으며, 장애물이 있으면 BFS 경로에서 보이는 구간을 묶고 안전한 모서리를 완만하게 돌게 한다. 속도72 world units/sec, 프레임 시간 누적 방식으로 탭 복귀시 순간 이동을 막는다.

실제 터치 위치를 목적지로 사용한다. 같은 칸 안의 작은 이동도 가능하다. 논리적 칸은 정원 상호작용에 유지하며 별도의 정확한 위치를 `pogeun-avatar-position-v1`에 보존/검증한다. 연속 목적지 변경은 현재 화면 위치에서 이어진다.

지속 Canvas/SVG patch를 유지하고 프레임마다 이미지/Canvas를 재생성하지 않는다. 실시간 깊이 정렬도 기존 노드를 유지한다. `momo.js`는 모모에게 치즈 고양이4방향 걷기 프레임을 적용하고 이동중 잠든 그림이 미끄러지지 않게 했다. 일반 방문 동물도 빈 경로를 직선으로 걷는다. 모든 동물의 모든 방향을 사람이 프레임별로 검수한 것은 아니다.

## 공중섬

`art/world/island-floating.webp`는 푸른 하늘, 떠 있는 흙/잔디섬, 아래의 바다와 오른쪽 나무 계단을 포함한 새 내장 imagegen 그림이다. 집/가구/캐릭터는 포함하지 않고 엔진이 배치한다. `ocean-edge.webp`는 원화의 아래 바다 경계를 반사 반복해 세로 화면에도 바다가 이어지게 준비한 텍스처다. 기존 앞집/방/가구는 보존한다. 조작 가능한 잔디는 가장자리에서 떨어지지 않게 제한한다. 바다 전용 동물은 아래 바다에, 물개·물거북 등은 오른쪽 계단을 오르내리는 위치에 배치한다.

## 서울 날씨

- 공급자: Open-Meteo Current Weather, 서울 대표 좌표37.5665,126.9780, Asia/Seoul. 위치 권한/개인 위치/사용자 키는 필요 없다.
- API: https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m,weather_code,precipitation,rain,showers,snowfall,is_day,wind_speed_10m&timezone=Asia%2FSeoul&forecast_days=1
- 문서: https://open-meteo.com/en/docs — current는 기상 모델 데이터이며 지역에 따라 시간 보간을 쓴다. 실제 거리의 관측을 초 단위로 그대로 복제하는 기능이라고 표현하지 않는다.
- `weather.js`: 시작/10분 간격/탭 복귀시 현재 데이터를 확인. 온도·날씨·제공 시각·연결 상태와 출처를 UI에 표시한다. 비/눈/진눈깨비/구름/안개와 낮밤을 반영하고, 하늘 밝기와 강수 강도는 서서히 전환한다. 실내에는 비·눈을 그리지 않는다.
- 연결 실패시2시간 이내 마지막 데이터를 ‘최근 날씨’로 표시한다. 그보다 오래되거나 캐시가 없으면 ‘연결 대기’로 표시한다. 맑음을 최신 날씨라고 꾸며내지 않는다. 앱은 계속 플레이된다.
- 무료 공개 API/프로토타입을 사용했다. 상업 운영 전 공급자 요금/라이선스 및 실제 iPhone/인앱의 장시간 연결을 재검토한다.

## 조개

재화 이름은 사용자 확정대로 ‘조개’다. `pogeun-shells-v1`에 잔액을 저장하고 사과1개→5조개, 물고기1마리→8조개의 초기 교환가를 적용한다. 재고가 없으면 다시 팔 수 없다. 옷장의 기본 코디는 자유롭게 입을 수 있다. 조개로 구매하는 전체 상점·온라인 계정·유저 거래는 이번 변경에 포함하지 않는다. 잔액은 이 기기의 로컬 저장이며 결제 재화가 아니다.

## 아트 제작 기록

모두 내장 imagegen 사용. 로컬 편집기로 캐릭터 그림을 새로 그리지 않았다. 최종 작업 자산:
- 여자 원본 생성: `exec-e6e58f46-69a3-4bba-b699-82d0e93e6f15.png` (불사용 첫 후보 `exec-ec15d065-ceef-4595-b3f1-7ebc5a53e35a.png`).
- 남자: `exec-fb3bc6d5-269e-4a4d-9a4f-a71c8ff17ef6.png`.
- 공중섬: `exec-d88e7d5c-1869-4511-a4e6-22586150d334.png`.
- 제작/정규화: `tools/normalize-living-sprites.py`, 투명 알파/색 번짐 정리, 실제 행 간격 검출, 공통 스케일·발바닥 기준 정렬. 원화는 생성 도구가 보관하고 웹용 정규화 자산만 이 저장소에 포함한다.

프롬프트 요지: identity-preserving original cozy16-bit JRPG sprite atlas, natural rounded chibi body, black straight long hair for girl, pink/sky-blue tee and denim shorts, same perceived head size, four directional rows and idle+5 gentle walk frames, true transparency, no labels. Floating world: clean blue sky above, an unobstructed grassy floating platform with visible brown underside, ocean far below and a small right-side stair; no house/animals/UI, soft warm pixel outlines,2–3 tone cel shading. 이전 얼굴을 참조했고 다른 게임의 캐릭터·로고·옷 원본을 복사하지 않았다.

## 검수/남은 사항

자동 테스트와 실제 데스크톱 Chromium390×844 크기 브라우저 동작 검사를 수행한다. 비/눈/캐시/오프라인은 응답 fixture로 검수하며, 공개 배포 후 실제 공급자 연결도 구분해서 확인한다. QA 영상은 실제 touch handler로 왕복 걷기를 캡처한 것이다. 이미지·이동·날씨 논리 검사를 실제 iPhone Safari/카카오 인앱 체감 검수나 장시간 체류 검수와 혼동하지 않는다.

후속 품질 과제: 실기기 터치/메모리와 장시간 날씨 갱신, 일부 의상·돌봄 자세의 독립 원화, 자연스러운 방문 동물 입장/퇴장, 방 가구 배치, 미용실, 조개 구매 품목. 이번 작업을 게임 전체 완성/상업 출시라고 표현하지 않는다.
