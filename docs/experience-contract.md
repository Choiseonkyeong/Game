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

## 0.9.0 — living rooms, play framing and the Tokyo chapter (Claude)

User request (2026-10-18 KST): every object, including desk, bed and chair, should move like a real object; the room felt too large for the screen; build the next chapter after the first.

- Room objects: `room-bodies.js` cuts each object from the painted room by polygon and moves it in place with spring physics (`BodyMotion`: sway, leaf, rock, wobble, squash, hop, shake). The hole is filled from its own surroundings, never a duplicate edge. Tapping the desk jolts it and the mug, laptop, pencils and cube react a moment later. Chair, suitcase and basket rock on their contact points; jacket, cards and frame swing from their hooks; plants rustle; bed, pillow and tote squash. Tapping a target that opens a close-up shows the reaction first.
- Close-ups: opening and closing use material springs (`MATERIALS`): the drawer knocks its stop and bounces back, the pillow lands softly and flattens, the tin lid overshoots lightly, the chair is heavy. A slow release still stays where the hand left it; only a quick flick carries the object to its end. Loose contents lag behind the motion (camera in the drawer, pillow and lid tilt).
- Framing: `stageFit` shows about half the room width on a portrait phone (previously ~28%) and the whole width on desktop/landscape. Above and below the framed room the wall and floor continue as softened edge colour with a feathered hand-off (`room-frame.js`), not a second copy of the room. `fitRoom` is kept unchanged for the legacy journal.
- Chapter 2 · Tokyo (`tokyo-room.js`, `tokyo-engine.js`, save `little-travel-tokyo-v1`): drag or tap the tote on the counter hook until it swings hard enough → the claim ticket No. 27 slips out of its pocket and falls with a bounce → open the counter drawer → only envelope 27 can be taken, and only with the ticket → switch on the desk lamp → read the negative on the lightbox with the loupe (the true picture shows only under the loupe and only in light) → choose the sharp frame (others are light-leaked, shaken or blank) → pin the print on the photo board, where it swings on its pin. The printed picture is the player's own Seoul photo when it exists.
- Routing: `?chapter=seoul|tokyo`; without a parameter the last opened chapter resumes. Seoul completion now links to Tokyo. Legacy route and all saves (`danchu-travel-v6`, `little-travel-first-room-v1`) unchanged.
- Limits: physics is 2D layer motion on painted art, not a 3D simulation. Automated tests and headless-browser screenshots do not prove iPhone touch feel, frame rate or fun.

## 0.10.0 — country identity, taller rooms, painted paper clues (Claude)

User feedback (2026-10-18 KST): Tokyo looked like Korea; the tote, coat and desk lamp showed doubled while swinging; paper clues looked like a different drawing; the room still felt too large and awkward — extend it vertically too and add detailed clues.

- Taller plates (`tools/bake_rooms.py` → `seoul-tall-v10.webp`, `tokyo-tall-v10.webp`, 1536×1360): 176 rows of ceiling are added above and 160 rows of out-of-focus close floor below. A portrait phone now sees the room nearly top to bottom (`stageFit(..., PLATE.height)`; ≥85 % of the height, ≥40 % of the width). Game logic keeps the original 1536×1024 coordinates (`innerGeometry`, `roomGeometry`); negative y addresses the ceiling rows.
- Tokyo identity painted into the plate with the same grain and light: shop sign ミナミ写真館 over the door, indigo noren with the 写 crest, red chōchin lantern, glass fūrin at the street window, Japanese price cards on the shelves, フィルム現像 decal on the door, beckoning cat on the back counter, いらっしゃいませ doormat. Lantern, noren, fūrin and cat are movable bodies.
- New detail clues: the fūrin paper strip reads 「お預り証は鞄の外へ」 (claim ticket → tote's outer pocket); a receipt on the floor by the counter marks 「◎ 3コマ目 ピント良好」 (frame 3 is sharp). Both open a paper card with the Japanese text and a Korean line.
- Seoul: a hanji paper pendant lamp hangs in the new ceiling space and sways when touched.
- Paper clues (claim ticket, envelopes 12/27/31, film strip, photo paper) come from a painted sprite sheet (`tokyo-papers-v10.webp`) instead of vector drawing.
- Doubled image fix: the moved object's old place is filled from its surroundings and backed by their true average colour (previously a 1-pixel downscale sampled the empty centre, and a second destination-in pass reduced the mask to a thin ring, so the original showed through). Tote, coat and bag outlines were widened so no part stays behind.
- Limits: added ceiling/floor are painted extensions of the existing art, not newly commissioned illustrations. Real iPhone/KakaoTalk confirmation is still needed.

## 0.11.0 — natural bending motion and Tokyo Tower (Claude)

User feedback (2026-10-18 KST): touched objects move cheaply; Tokyo needs a landmark like Tokyo Tower outside, not only Japanese text.

- Hanging cloth (tote, coat, noren, lantern, wind chime) now bends from its hook in thin slices: displacement grows with distance from the anchor and the free end follows a moment later (`BodyMotion.bend`). Plants bend from the pot the same way. Rigid furniture (chair, suitcase, desk items) moves about half as much as in 0.9–0.10, so a tap reads as a nudge rather than a cardboard wobble.
- Tokyo Tower (international orange with white bands, two observatories, lattice, haze) stands in the sky of the big shop window between the trees, with a hazy skyline and street power lines (`tokyo_street_view` in `tools/bake_rooms.py`). The noren now hangs over the door only, so the window view stays open.
- Asset query bumped to `v=110` because image contents changed under the same file names.


## 0.11.1 — observe before printing; interruptible bag handling (Codex)

Continue from remote master `8b0a22f622b444d89ac76efc281d747a3cc7e31c` (Claude's v0.11.0). Keep both chapters, Tokyo Tower, extended room plates and all existing save keys.

- Holding the Tokyo tote uses a damped hand-follow spring in source coordinates. Held poses remain visible even after their spring rests. Release, pointer cancellation and the second finger of a pinch all restore the free swing towards zero. A cancelled/pinched grip must not leave a tilted bag or keep requesting frames forever.
- The visible paper tip and falling ticket use the same `bodyPoint` transform as the cloth. The ticket starts at the moving outer pocket and inherits its lateral motion rather than jumping to the opposite side of the bag.
- Cloth and foliage bend; framed pictures, lanterns, glass wind chimes and pendant lamps keep their shape and pivot as rigid objects. Existing source art/masking is retained. Texture reconstruction and more precise object silhouettes remain a separate art pass, not claimed solved here.
- Inspecting or dragging across film frames never prints or consumes an attempt. Tapping a frame moves the loupe there; the player compares the images and explicitly chooses **이 컷 인화하기**. The button is enabled only with a negative, light, a loupe centred on a frame and no animation in progress. Wrong prints preserve the negative. Keyboard arrows move the loupe and Enter/Space prints the selected frame.
- Hints advance per puzzle phase from an observation to a location to an explicit solution. Finishing a phase starts the next phase's hints gently; longer messages stay visible long enough to read. No new mandatory clue-reading flags or save schema were introduced.
- Verification: deterministic pointer-handler flows, interrupted-grip settling, rigid shape preservation and static Canvas film/bag renders. Actual browser CSS and real iPhone touch/frame rate are not verified by these checks. Seoul desk/chair close-up continuity and hole-fill art remain follow-up work.


## 0.12.0 — registered furniture, clean tote layers and quieter light

Continue from remote master `4969160ab757981852ea447d9fe21aeb95d45173` (v0.11.1 release record). User screenshots show sliced/duplicated counter drawers, a brown tote patch, an oversized pasted print, a triangular light overlay and empty chrome. This pass changes their visual construction, not puzzle answers or save schemas.

- `tokyo-clear-v12.webp` is a derived, registered clean room plate with the tote and original open drawer removed. The repeated ceiling band is repaired. Original room/Tokyo Tower source assets remain in the repository; exact Japanese price labels are restored from them. Moving bodies sample the same clean plate they stand against.
- `tokyo-tote-v12.webp` is a true-alpha cloth sprite, including transparent handle gaps. `BodyLayer.spriteOverrides` paints it at rest and while moving with no guessed hole fill. Both the visible paper tip and falling ticket keep the existing cloth transform. There is no full-size offscreen room composition.
- `tokyo-visuals.js` owns one drawer geometry used by room and close-up. The wooden face is sampled from its sloping quadrilateral, not a rectangular crop containing books. Tray, sides, contact shadow and front remain attached. Envelopes and the tray floor translate rigidly and are clipped by the fixed opening; they never squash as the drawer closes. Touch targets use the same projected envelope polygons. Returning to the room closes the drawer first.
- The pinned print is 58×70 source pixels, with a 2.7px pin, shallow paper shadow and a warm tint; pin landing uses its new centre. Desk light is a weak, elliptical surface pool plus a small bulb glow, without a yellow triangle across the room.
- Tokyo close-ups draw their background into the visible area rather than leaving large grey bars. Seoul desk/chair views use a cover crop, share the same chair sprite and drawer contents move with the tray. Opening the desk moves the chair aside; closing/return restores it. Separate chair inspection still pulls it forward.
- Empty inventory circles and empty toast pills are hidden. Room pan arrows hide behind detail views. Detail headings wrap safely; cards scroll in short viewports; print controls have a minimum touch height.
- Verification: full existing pointer flows (including return closure), drawer seam/rigid envelope geometry, static Canvas states. Actual browser and mobile checks must be separately recorded against the deployed source, not inferred from these tests.


### 0.12.1 — issues found in the deployed browser pass

Actual desktop browser inspection of v0.12.0 found a wide blank left margin in the Tokyo close-up and a missed click on the visible room drawer handle. Align the drawer scene to the left in landscape without cropping the envelope row; portrait framing remains unchanged. Room hit testing now uses the same projected drawer front/tray polygons as the renderer instead of an old rectangular hotspot. Assets/cache queries are v121. Deployment provenance and browser checks are recorded separately in release-state/UPDATE_LOG.
