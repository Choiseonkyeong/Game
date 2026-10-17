# 작은 여행책 — 누적 플레이 경험 기준

이 문서는 2026-10-17까지 수밍이 요청한 내용을 다음 작업에서도 유지하기 위한 기준이다. 새 버그를 고치면서 이전 동작을 완성 그림 전환 등으로 단순화하지 않는다. 공동 원본/동시 작업 규칙은 AGENTS.md와 guard-shared-game 스킬을 함께 적용한다.

## 반드시 유지

- 성인도 흥미를 느낄 수 있는 밝고 편안한 2D 여행 퍼즐. 캐릭터·아이템·배경의 재질, 색감, 원근을 맞춘다.
- 브레인퍼즐에서 출발한 상황 조작과 발상의 전환이 중심이다. 조사 카드 두 장 연결이나 긴 설명만으로 게임을 대체하지 않는다.
- 단서는 물건이 보관된 이유와 이야기로 연결된다. 베개 아래 메모 → 축광 소유표 → 카메라 보관함 → 필름 조합 → 창가 첫 사진처럼 다음 호기심이 이어져야 한다.
- 상시 동작 이름/정답 설명/자동 조사 팝업을 추가하지 않는다. 필요할 때 메모를 확대하거나 ? 힌트를 연다.
- 숨은 아이템은 생활 소품 안에 놓고, 기본 화면의 거대한 아이콘·반짝임·이름표로 정답 위치를 표시하지 않는다.
- 휴대폰 전체 화면, 상하좌우 탐색, 서랍 안 확대, 책 페이지, 액자/쪽지 앞뒤, 망원경과 초점을 유지한다.
- 커튼은 원본 소재를 사용하고, 내린 비율에 따라 침대와 바닥/러그의 햇빛이 줄어든다. 어둠의 숫자는 보관함의 실제 축광 소유표에 속한다.
- 단추의 화면 캐릭터와 이동 조작은 사용자의 요청으로 제거했다. 다시 추가하지 않는다.
- 기존 저장·완료 기록·30단계를 보존한다. 최신 원격 master에 작은 변경을 통합하며 다른 작업자의 변경/URL을 덮어쓰지 않는다.

## 조작과 보상 검수 기준

1. 손을 움직이면 실제 물체가 중간 위치를 거치며 움직여야 한다. 완성 그림의 교차 페이드만으로 연속 동작을 대체하지 않는다.
2. 천을 조금 걷으면 조금만 보이고, 반대로 밀면 다시 덮인다. 배경/가구/가방까지 함께 늘어나면 실패다. 손을 놓아도 끝 상태로 강제 점프하지 않는다.
3. 베개는 들어 올린 뒤 아래가 보인다. 메모가 베개 위에 갑자기 뜨지 않아야 한다.
4. 상자·서랍은 열린 물리적 상태와 내부 확대가 일치해야 한다. 물건은 챙기기 전 내부에 존재하며 챙긴 뒤 원래 자리에서 사라진다.
5. 획득은 발견 장소 → 이동 → 소지품 착지로 이어진다. 이동 도중 목적지에 같은 아이템이 복제돼 보이지 않는다. 조합/사용/촬영에도 짧고 분명한 반응을 준다.
6. 관찰은 다음 행동을 궁금하게 해야 한다. 조작 실패가 진행을 지우거나 정답 설명을 자동으로 열지 않아야 한다.

## 현재 V6.5 적용 범위와 남은 검수

서울 첫 방: 불투명 천 스트립 변형, 베개 분리 이동, 천 아래 상자 가림, 빈 상자, 서랍 트레이 및 실제 장면 확대. 공통: 획득 곡선/착지, 재료 조합 반응, 직접 조작, 기존 단서 연결.

이것은 준비된 원화 레이어를 쓰는 2D 애니메이션이며 자유로운 천 물리 시뮬레이션은 아니다. 다른 다섯 도시의 모든 물건에 같은 수준의 연속 애니메이션이 적용됐다고 주장하지 않는다. 21개 자동 검사와 캔버스 6상태 정적 검사는 실제 iPhone의 손맛·프레임 속도·흥미도 평가와 별개다. 실제 기기에서 그 세 가지를 확인한 뒤 완성도를 판단한다.

## V7.0 이후 추가 유지 기준

- 빈 소지품은 작은 도크로 접고 탐색 화면을 확보한다. 전체 보기 여백을 큰 단색 공간으로 방치하지 않는다.
- 미리보기는 저장 기록을 건드리거나 매 프레임 deep clone하지 않는다. 같은 조사 버튼 마크업을 매 프레임 교체하지 않는다.
- 서랍 확대는 캐리어/책상 아래의 크롭이 아니라 내부가 주인공인 원화를 사용한다. 엽서 이동/뒤집기와 그 아래 수집품을 유지한다.
- 조사 창의 열림/닫힘, 책 넘김, 사진 뒤집기와 잘못 놓은 아이템의 복귀에도 마무리 동작을 둔다.
- 화면 버전을 메뉴에서 확인할 수 있게 하고, 오래된 코드/CSS가 새 화면에 섞이지 않도록 자산 버전을 함께 관리한다. 캐시 문제 해결을 이유로 플레이 기록을 초기화하지 않는다.
- 실제 기기 검수와 자동 검사/정적 합성은 별도다. 아직 검증하지 않은 손맛을 완성했다고 말하지 않는다.

## 0.8.0 — one finished chapter before expansion

User decision: prioritize one coherent first stage, even ahead of the thirty-stage story. Default entry now routes to `first-room.js` in an isolated Shadow DOM. The previous full game remains intact at `?mode=legacy`; its `danchu-travel-v6` save is never read or overwritten by the first chapter (`little-travel-first-room-v1`). This is an intentional replacement of the default experience, not accidental loss of requirements.

First chapter: pull desk drawer → collect camera; lift pillow → read film storage note; lift shelf tin lid → collect film; drag film into camera → frame Namsan Tower → save actual captured photo. These are linked discoveries with one goal. No avatar, arbitrary glowing code, duplicated notebook, generic dead investigation targets or warped duvet slab in this chapter. Curtain retains the original fabric and registered sunlight compensation. Horizontal and vertical room gestures remain. New independent pillow/tin/film/camera layers move with damped follow, settle and return; only validated collection commits on landing.

Future workers: improve this default chapter rather than reverting entry.js to play.js or importing a stale whole-folder snapshot. Preserve legacy access and both save keys. Do not claim movie-quality animation or real-phone smoothness from unit tests.

### 0.8.1 — one background and direct pinch inspection

Remove the second room backdrop entirely. Normal room view uses a single cover transform; overview letterboxing is a solid matte. Detail views are opaque and hide the room HUD; drawer interior never shows a closed desk/drawer behind it. Two-finger pinch zooms room (1–2.6×) and detail (1–2.8×), preserves the source point beneath the midpoint, suppresses object commands throughout the gesture, consumes both releases and allows detail panning from empty space. Finger drag maps1:1 to room pixels. Room material/light composition is cached across camera moves; redraw only transformed room pixels while panning. Cap rendering density1.5× and use elapsed time for damped object follow. Previous full game and both saves unchanged.

### 0.8.2 — desk structure and optional room life

Drawer close-up now has a complete matching desk station with fixed cavity/rails/legs and floor. A registered tray grows from the opening and its front remains attached, instead of a detached front over a brown rectangle. Chair uses the same desk rendering and an independent woven-seat chair sprite; pulling it out and returning it does not grant an item. Botanical frame close-up/pinch and basket interior/lean-in are optional, have no fabricated code or clue, and never complete a mission. Return settles these optional actions before the original room reappears.

Only the new first chapter is playable in this default experience. Completion explicitly says the next story is in preparation; the primary action is to keep exploring, with retaking the photo available. Do not create a fake next-stage button or imply all30 legacy scenes match this quality. Legacy route and saves remain.
