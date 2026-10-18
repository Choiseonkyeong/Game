# 마지막 현상실 · 플레이 가능한 첫 사건 · v0.20.0

별도 진입 `dist/afterlight/index.html`, `?mode=afterlight` 또는 기존 메뉴의 새 사건 링크. 기존 여행·사진관 첫 의뢰·모든 저장 보존. 새 저장은 검증 코어의 `afterlight-lab-episode01-v2`이며 이벤트 재생과 UI 관찰/메모/배달 가설을 저장한다.

- 첫 행동: 작업대 봉투를 직접 열어 의뢰 발견. 별도 환영 페이지 없음.
- 같은 방의 3개 개별 포스트잇: 앞면은 순서, 뒷면은 배달 관계. 한 사람의 종이를 한 장씩 들어 읽고 뒤집음.
- 인화 순서: 네 판을 드래그하거나 두 장 차례로 눌러 교환. 세 규칙을 실제 코어로 판정하고 캐리어 개방.
- 투과 장치: 마스크와 좌우 반사를 정확히 렌더링. 샘플 실험, 실제 통과점, 최근 실험 비교, C3 서랍 개방. 숨겨진 정답용 그림 없음.
- 보관함/배달: 장부의 두 사실과 메모 뒷면을 교차 추론. 빈 사진에 이름표/행선지표를 한 장씩 놓고 가설 수정. 옳은 조합으로 전체 사건 해결.
- 첫 사건 결말, 답장 재열기, 단계별 무료 힌트, 선택형 짧은 효과음, 저장 제한 안내, 이 사건만 재시작하는 확인 흐름.
- 실제 폰 검수, 외부 사용자 재미 검증, 상용 결제 및 다음 사건은 별도이며 이번 완료로 주장하지 않는다. 네 인화 사진은 별도 생성한 2×2 사진 아틀라스의 새 작업실·오래된 가게·소포·카메라 장면을 사용한다.

## 원화

Built-in image generation skill/tool 사용. 원본 `/workspace/scratch/b26c220b52f1/generated_images/exec-6922a714-b0a3-4b8e-87f0-4ee49fcb50b7.png` (1024×1536), 게임 자산 `dist/afterlight/room.webp` (형식 최적화만 수행, 구도·내용 보존). 게임의 판/문자/기호는 결정적 HTML/CSS/코드 자산.

Prompt:

> Use case: stylized-concept. Asset type: production background for a premium first-person mobile escape-room game set in an old Japanese photographic darkroom, no characters. Portrait 1024x1536 composition. Cinematic highly detailed tactile 3D environment, believable human scale, warm walnut, aged brass, deep olive metal, amber task light, softly glowing red safelight, sophisticated understated mystery not horror. Camera faces a handsome large empty wood workbench, shelves of film tins above, one old enlarger on far left, metal archive drawers on the right, small rain-speckled window at upper right with muted evening city light. Bench surface occupies bottom half and is completely clear as a place for gameplay objects to be added by code. Central upper portion is a quiet olive plaster wall, not clutter. Three coherent depth layers, physically plausible perspective, grounded natural shadows, rich material detail but clear readable silhouettes. No loose chairs, no letters, no notes, no film strips on bench, no people, no signs, absolutely no text, no letters or numbers, no UI, no borders, no watermark. Full bleed image suitable as game scene, visual focus center and lower center.

## 검증

검증 코어와 배포 코어 바이트 일치, 3개 신규 플레이 인터페이스 검사, 전체 엔진 3단계/오답/저장 검증. 실제 브라우저에서 수행한 범위와 배포 SHA는 UPDATE_LOG와 release-state의 후속 기록이 기준이다. 자동 검사는 이미지 품질과 재미를 입증하지 않는다.

## 인화 사진 원화 보정

Built-in image generation. 원본 `/workspace/scratch/b26c220b52f1/generated_images/exec-6d5c55d8-636a-4d8d-b177-b4fe1b825029.png`, 게임 자산 `dist/afterlight/photos.webp`. 2×2 사진 아틀라스이며 정밀 퍼즐 도면이 아닌 이야기 보상용 사진.

Prompt: Use case: illustration-story. Asset type: one 2-by-2 contact sheet atlas of four distinct fictional photographic prints for a premium atmospheric escape room game about the last day of a Tokyo neighborhood photo studio. Four equal rectangular quadrants arranged exactly in a clean 2x2 grid, no gutters, no frames, no borders, no visible text, no letters or numbers, no UI. Top left: warm sunlit small empty new studio with two plain wooden chairs near a large window and pale olive walls, hopeful morning. Top right: wide nostalgic exterior of the old neighborhood photo shop, weathered dark green glass door and wooden frame, no readable signage, late afternoon. Bottom left: intimate still life of a hand-tied parcel wrapped in brown paper beside a cup and small flower on the counter, quiet farewell. Bottom right: nostalgic still life of an old film camera beside a folded scarf and a small potted plant in warm window light, personal keepsake. All four are well-composed believable documentary analog photographs, consistent warm film grain, nuanced real materials, sophisticated quiet Japanese photography, physically plausible perspective. No people. Each of the four quadrant pictures should have a clearly different recognizable main subject. Full image landscape 1536x1024. Only the four photographs, no lettering, no watermarks.
