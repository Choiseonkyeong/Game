# 포근섬 첫 아트 세트

최신 master e2ab351의 문서·관절 좌표를 기준으로 제작한 독자 디자인. 모든 원화는 내장 image_gen으로 제작했다. 다른 게임의 캐릭터·이름·로고·고유 의상을 사용하지 않았다.

- 캐릭터: 512×768 무손실 투명 WebP 71장, body/cream·face/cream·bob-chestnut·sailor·skirt·brown. 정면24 / 뒷면23 / 오른쪽 옆면24. body 연결부는 단색 원화를 공유해 시점별 피부색을 유지한다. 외곽 끝선을 관절 안쪽으로 노출하지 않고 겹쳐서 내보냈다.
- 헤어·얼굴: 정면 디자인을 기준으로 후면·옆면 생성. 피부·머리카락·옷 모두 동일한 캔버스에 위치한다. `pogeun-art-production.json`에 파트 위치·원화 ID·최종 SHA256 기록.
- 배경: 같은 해안선의 낮/노을, 1920×1600. 바다·모래·잔디만 포함. 가구는 별도 배치.
- 소품: 14종, 투명512×512, 바닥 접점 하단 중앙. 기존 가구 이름·저장 구조 유지.
- 아이콘: PNG512/192와 별도512 maskable. 인물·꽃을 중심60%에 모은 전용 안전영역 구도.

등록 위치는 `dist/island/art/manifest.json`. 정지 합성은 `docs/art/qa/front-rest.png`, `back-rest.png`, `side-rest.png`. 이 PNG는 실제 레이어를 리그 대기 자세의 순서로 합친 검수 원본이다.

## 원화 프롬프트

공통: original Pogeun Island, 2.5-head chibi, smooth thick cocoa outline, warm cream/peach/sage/teal pastels, 2–3-tone cel shading, top-left light, transparent background for cutouts, no existing IP, no logo/text/watermark.

정면 디자인: full-body original human, chestnut bob with swept curved fringe, chocolate sparkling eyes, gentle smile, ivory sailor blouse with dusty teal rounded collar and coral knot, peach A-line skirt, brown rounded strap shoes. Crown64, neck256/332, shoulders196/316 at352, elbows184/328 at444, hip256/524, knees224/288 at628, soles744 on512×768. Neutral rest pose, no hat/bag.

후면·옆면: same exact original person from front reference; BACK with no face and rear sailor collar / RIGHT PROFILE with one eye and right-facing nose; template per-view joints; same outfit/palette/outline/light.

분리 파트: only the named layer/part, all other pixels transparent; no complete character, no background/glow/cast shadow. Preserve reference color and filled overlap around joints. Face contains only eye/brow/cheek/smile marks. HairFront leaves transparent face opening. Clothes contain only fabric. Hidden cream connecting parts use a smooth filled cream lozenge with cocoa side outline and a peach edge shade, no mechanical detail. Technical export aligns each source to shared joint coordinates, removes low-alpha generated halos and losslessly encodes.

배경: empty 2:1 isometric island, fullbleed mint ocean, pale sand rim and uncluttered sage grass for9×9 grid, no props/people/text; sunset edit changes only palette, preserving shore/grass/composition.

소품: ONE cozy original isometric object, smooth cocoa outline, warm pastel cel shades, top-left light, transparent, no ground patch/cast shadow/text. Kinds: cream/sage cottage, oak cushion bench, terracotta empty pot, apple tree, ceramic water bowl, stone lily pond, oak tea table, sage cushion, lantern post, cream flagstone, oak fence, daisy/tulip/lavender terracotta pots.

아이콘: same original bob-haired person holding a daisy pot, mint sea/grass/sand accents, no text or frame. Maskable edit zooms out into central60% safe area with uninterrupted sea margin.

## 연결 보정

rig-preview가 manifest를 로드하고 대기·걷기·물주기·인사 3시점과 실제 게임의 옆면 앉기를 연속 표시하도록 수정. ±30° 관절 검사 슬라이더는 실제 부모/자식 관절 회전을 사용한다. 리그는 머리카락이 머리 관절을 따르도록 하고 팔 겹침 순서를 보정했다. 미제작 코디를 골라도 기본 옷이 사라지지 않도록 벡터 대체를 유지한다. 디딤돌/울타리에도 등록 소품을 사용한다. 그림의 투명 캔버스가 뒤쪽 사물 클릭을 가로채지 않도록 이미지 포인터 이벤트를 끈다. 세이브·게임 규칙·다른 게임 경로는 변경하지 않는다.

자동 검사·실제 브라우저·실제 폰은 별개다. 최종 배포/검수 결과는 UPDATE_LOG와 release-state를 따른다.
