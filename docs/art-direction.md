# V4 시각 방향 — 따뜻한 수선집의 조용한 수수께끼

## 최종 기준

캐릭터·아이템·배경은 따뜻한 꿀빛 나무, 크림색, 세이지 그린, 절제된 청록색을 공유한다. 밤의 시각 설정은 창밖의 부드러운 파란 달빛으로 남긴다. 실내는 가구와 단서가 충분히 보일 정도로 밝게 조명한다. 공포·위협·점프 스케어는 사용하지 않는다.

배경 6개와 아이템 시트는 첫 어두운 시안에서, 단추의 포즈 시트를 스타일 참고로 삼아 다시 생성했다. 최종 결과만 게임에 사용한다. 장면마다 가구의 배치와 조사 지점이 다르다.

## 파일

- `dist/case-art/bedroom.webp` — 침실
- `dist/case-art/observatory.webp` — 천문실
- `dist/case-art/workshop.webp` — 시계 작업실
- `dist/case-art/archive.webp` — 기록실
- `dist/case-art/music.webp` — 음악실
- `dist/case-art/greenhouse.webp` — 옥상 온실
- `dist/case-art/poses.webp` — 단추 4×2 포즈 시트
- `dist/case-art/items.webp` — 아이템 4×4 시트

모두 기본 제공 ImageGen으로 제작했다. 최종 PNG는 WebP로 인코딩해 프로젝트에 넣었다. 포즈와 아이템의 칸은 CSS로 표시하며 별도의 내용 수정이나 임의 합성은 하지 않았다.

## 배경 최종 편집 프롬프트

Image 1 is the room edit target. Image 2 is the visual style reference for its resident plush cat. Keep the exact camera, room layout, all furniture and object locations, and the investigation clues in image 1. Transform only the art treatment, palette and lighting to harmonize naturally with image 2 as one cohesive 2D animated storybook game. Warm, welcoming, curious atmosphere for a general adult audience, never horror or threatening. Lift the room's exposure considerably so every furnishing and floor is comfortably visible. Soft amber lamplight plus gentle blue-lavender moonlight; warm cream, honey wood, sage green and muted teal accents. Softly rounded illustrated edges and subtle painted texture, slightly stylized proportions, tactile cloth and wood, detailed but no photographic microtexture or hard glossy 3D rendering. Keep nighttime visible outdoors, but inside should feel as friendly and well-lit as a cozy bookshop or animation family home. Reduce nearly black shadows to softly colored brown/teal shadows. No cats or characters added, no text, no UI, no logos. Preserve landscape aspect ratio and all prop positions.

## 아이템 최종 편집 프롬프트

Edit target is image 1, a strict 4x4 item atlas; image 2 is supporting character style reference. Keep all sixteen objects, exact cell order, object identities, grid layout and recognizable fine details unchanged. Change the illustration style and lighting so these props belong naturally beside the plush cat in image 2: warm approachable hand-painted 2D animated storybook art, softened illustrated contours, matte materials, gentle warm shadows, painterly wood and brass, refined detail without photographic or 3D-render gloss. Replace the dark charcoal background uniformly with a flat warm parchment cream #f2e6cf. Keep one centered object in each of the 16 equal cells; no text, no borders, no new objects. Clear mature inventory illustration, cozy investigative adventure, not childish sticker icons, no ominous feel.

## 포즈 시트 프롬프트

Use case: illustration-story. Asset type: exact 4-column by 2-row game sprite atlas on TRUE transparent background. Reference image is the character design reference only: keep this same orange plush cat Button, sage knitted scarf, blue ear patch, brass bell, canvas satchel and expressive amber eyes. Sophisticated hand-painted 2D animation character sheet. Eight equal square cells in strict 4x2 grid, no borders, no labels, no text. Each entire character must fit within its cell with at least 10% empty margin, absolutely no overlap across cells, consistent size except sleeping pose. No background tint, no glow halo, no ground shadows. Row 1 left to right: 1 neutral standing alert front three-quarter; 2 thoughtful worried expression with paw at chin; 3 walking toward LEFT in clear left profile stepping pose; 4 walking toward RIGHT in clear right profile stepping pose. Row 2 left to right: 5 sleeping curled on side under a small cream blanket, eyes peacefully shut; 6 standing gazing upward, BOTH paws cupped around the eyes like a little visor to look at the sky, visibly different arm pose; 7 crouching to inspect floor through a small magnifying glass, focused face; 8 surprised expression, wide eyes, ears up and both paws slightly lifted. All poses distinct, accurate limbs, beautiful fiber/stitch details, refined animation proportions, original character. Transparent cutouts, no atmospheric backdrop.
