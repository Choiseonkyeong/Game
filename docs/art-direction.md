# V3 아트 제작 기록

제작 도구: 기본 제공 ImageGen. 아래 두 개의 새 이미지 자산을 생성하고 웹용 WebP로 인코딩했습니다. 주인공의 투명 배경을 유지하고, 인코딩 외에 이미지의 구도·색감·내용을 수정하지 않았습니다.

| 자산 | 프로젝트 경로 |
| --- | --- |
| 상세한 침실 배경 | `dist/art/bedroom.webp` |
| 단추 주인공 컷아웃 | `dist/art/button.webp` |

## 공통 프롬프트

Use case: illustration-story. High-end lovingly detailed 2D painted game art with the warmth, craftsmanship and expressive toy-world storytelling of a family animated feature. Not a 3D viewport or low-poly render. Soft painterly modeling, rich material detail, beautiful color design, rounded forms, warm amber lamp light with soft cool moonlight. Original designs only, no existing movie characters, no text, no logo, no UI.

## 배경 프롬프트

Asset type: portrait 2D puzzle game background, tall 2:3 composition. A cozy child's bedroom at night seen from the low eye level of a small toy. No characters. Deep teal walls with subtle wallpaper stars, large window at upper left with midnight blue curtains and moon, a neatly made low wooden bed at upper right with patchwork cream and dusty-blue quilt, a detailed small wooden bedside cabinet with a circular brass lamp base, stacks of illustrated books, a wicker basket of toys at far left, little wooden railway around edges, worn wooden floorboards, buttons and threads and a little hand-stitched fabric rug. Full, carefully drawn environment with convincing fabrics, wood grain, seams, tiny scratches, cozy storybook personality. IMPORTANT: leave the entire lower center 65% as relatively clear wooden floor/rug playground for interactive props and protagonist to be overlaid. Furnishings frame the edges and upper part. Main perspective should allow 2D sprites on the floor at front; no overhead view. Visually rich along the sides, quiet open center. No visible cats or dolls.

## 주인공 프롬프트

Asset type: one full-body 2D game character cutout on genuinely transparent background, no scenery. A charismatic small orange tabby plush cat toy named Button. Warm apricot plush with finely visible soft fiber texture and little stitches. Very large curious amber-brown eyes with light reflections, cream muzzle, cream tummy, small chocolate triangular nose, gentle cheek fur, round paws, three stitched whiskers each side, a rounded fluffy curled tail. A distinct muted blue fabric patch on its RIGHT ear (viewer left), hand stitched edges. A sage-green knitted scarf tied simply with a little brass bell. Tiny worn tan canvas satchel across body. Body facing front with slight 3/4 turn toward viewer right, standing on two short legs, looking curious and a little mischievous, one paw raised in a friendly questioning gesture. Appealing feature-film-quality proportions and expressive face. Entire figure including both ears, paws and tail inside canvas, no crop. Clear silhouette, no ground or cast shadow on background, no text. Painterly 2D style rather than literal 3D.

## 소품과 UI

소품은 기존 SVG 기반 아트 시스템을 확장해 그라디언트, 이음선, 바느질, 반사광, 그림자를 추가했습니다. 주인공과 배경은 이미지 자산으로, 조작 소품은 코드로 그린 SVG로 구성합니다. 서로 다른 표현 방식이 섞인 프로토타입이며, 후속 단계에서 소품별 원화로 통일할 수 있습니다.
