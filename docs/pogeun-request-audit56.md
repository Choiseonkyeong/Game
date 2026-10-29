# 포근섬 요청 대비 재검토 — 2026-10-29

검토 시각: 2026-10-29T16:07:56+09:00
Source: master@18d3bc23e440448a9679c8be764da9002724fdc3; live game source b77e75e59daedfe74813aea87774f838d948229e (Pages40831952402 success).
Task: 사용자가 '수정이 안된 사항이 많네. 재검토해'라고 지적. v55를 전체 요청 완료로 취급하지 않는다. 재검토 당시 게임 변경/새 배포는 없으며, 뒤이어 지시한 고구마90 보정은 아래 별도 조치로 추적한다.

## 최초 8항목 대조

| 요청 | 실제 상태 | 근거 / 남은 일 |
|---|---|---|
| 1. 부드러운 이동·방향키/WASD | 부분 반영 | v55 키보드/충돌/보존 구현 및 Chrome 동작 확인. 실제 폰 터치와 부드러움 검수 미완료. tick의 !steps 분기와 keyboardTick이 키보드 이동 중 같은 프레임에 서로 다른 보행 시간/방향 파라미터로 중복 paintHumans; 체감 영향 재현 필요. |
| 2. 씨앗→새싹→성장·새싹 보존 | 일부 검증 | 상태 단위 검사와 기본 사과나무 수확·Lv3 재접속 보존 확인. 구매한 7종 전체의 성장 화면/새 섬 왕복/실기기 시각 검수는 미완료. 현재 검토에서 새싹 소실을 재현했다고 주장하지 않는다. |
| 3. 옷장 오류·요청 의상 | 누락 | ITEMS에 파스텔 니트는 있지만 리본 블라우스/멜빵바지/베레모 없음. 코티지코어 원피스 전용 구현 없음. 기존 리본 데일리 원피스를 요청 의상 완료로 세지 않는다. accessory UI는 '보유한 액세서리가 없어요' 고정. |
| 4. 씨앗상점·제목 유리 판넬·공중 섬 배경 | 누락 | 실제 DOM seedMarket이 art/seed-shop-original.jpeg + 투명 클릭 영역7개 사용. 독립 카드/제목 유리 판넬/승인한 떠있는 섬 배경 미적용. glass54.css는 home controls only로 상점 제목과 무관. |
| 5. 동물 방문 절제 | 부분 반영·이전 안내와 불일치 | v55 첫20초, 퇴장 후60~90초. 이전 어시스턴트가 안내한 첫90초·이후3~5분과 다름. 90초/3~5분은 사용자 지정 수치가 아니라 이전 구현 안내였음을 구분. 새로고침하면20초로 재예약. |
| 6. 집 내부 가구와 캐릭터 1:1 감성 비율 | 미완료 | room.js는 기존 cottage-room.webp와 기존 침대 클릭영역155,265,232,235를 유지하고 캐릭터만1.2배. 가구(침대/소파/러그 등) 크기·클릭영역 재구성 미구현. |
| 7. Lv4 가축/목장 | 코드 존재·실동작 검증 부족 | progression/balance/core 입양 Lv4 제한, 가축5종·성장·먹이·생산 코드 존재. 이전 공개 검수는 Lv3 잠금까지만; 실제 Lv4 입양→먹이→성장→수확 전체 미검수. 이를 누락 코드라고 단정하지 않는다. |
| 8. 확장에도 원래 캐릭터 비율 고정 | 확인 범위 제한 | Lv2→3에서 표시143.1484×206.4000px 유지(scale1.08) 및 재접속 확인. Lv4~10/전체 동작/기기별 검수 미완료. |

## 추가 확정 불일치

- 공개 씨앗상점 그림의 고구마 가격은80, aria-label/SEED_CATALOG/구매 값은90. 그림과 실제 가격 불일치.
- wardrobeDisplay는 기본 외 니트 착용도 title='기본 코디'로 표시; 실제 공개 DOM에서 '파스텔 루즈 니트' 선택과 '기본 코디 · 정면' 미리보기 설명이 공존. 선택 명칭 일치 보완 대상.
- 승인 원화 '포근한 섬 씨앗 가게의 투명 유리 메뉴.png' 및 '파스텔 하늘 속 씨앗 가게.png'의 식별/읽기 성공. v55에는 이 승인 원화가 연결되지 않음. 읽기 응답은 이미지 포인터/메타데이터이므로 실제 픽셀을 비교했다고 주장하지 않음.

## 정정·검수 원칙

- 전체 CI156 통과는 존재하는 테스트의 성공이며 8개 요구 전체 구현·디자인 반영의 증명이 아니다.
- v55는 부분 완료 배포. 마지막 성공 배포 사실은 유지하되 요구사항 완료 상태는 false.
- 다음 구현은 상점 승인 원화 연결과 가격 표기, 요청 의상과 모션·저장, 실내 가구/클릭영역, 방문 일정, 실제 Lv4 플레이를 각각 완료 조건으로 검증한다. 승인된 얼굴/머리/비율/기존 UI와 요청 외 영역은 보존한다.

## 이번 원인 조치56

사용자가 고구마90 통일 및 원인 분석·재발 방지를 지시했다. 가격 그림의 숫자 부분만 실제 SEED_CATALOG로 렌더링하여 구매창/결제와 같은 값을 사용한다. 기본 원화는 보존한다. 출시 요청 추적표와 완료근거 검사, 공통 작업 규칙을 추가한다. 가격 수정의 공개 확인 전 상태는 pending이며, 나머지 누락 항목은 계속 미완료다.

## 고구마90 조치·배포 검수 완료

- Source master@0da0125026e4024639c6914a9c85f1b7a60b1e27, task branch codex/pogeun-audit56; Pages40834629733 success; public build-info exact source, built_at2026-10-29T07:19:04.909Z; checked 2026-10-29T16:22:09+09:00.
- Full CI159 passed/0 failed; local78 passed. Actual seedMarket/seedPurchase same-catalogue90, future135/100 label updates verified. Public Chrome island.js?v56: sweetpotato displayed90 and purchase-dialog90; original illustration intact outside the number; seven seed hit regions retained. Live purchase150->60 shells, seed0->1; reload retains60 shells and sweetpotato stock1. Public build-info exact source.
- 원인: 원래8개 요청 추적 부재, 확보 못한 최종본을 부분 대체하고 누락 미추적, 그림속 가격/구매 가격의 이중 관리, 기능 단위검사를 전체요구 완료로 오인.
- 예방: AGENTS/CLAUDE 필수 완료근거, docs/pogeun-requirements.json, CI coverage report와 --require-complete 게이트. 미완료가 있으면 strict 모드 실패. 가격은 live catalogue 기준으로 그림 숫자/선택/구매를 연결.
- 원래8개 전체완료 아님. 가격 행만 complete, 나머지는 기존 partial/missing 유지. 추가 게임 원화/의상/실내 변경 없음.
