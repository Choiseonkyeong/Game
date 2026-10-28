# 던전 브레이커

Claude 아티팩트(https://claude.ai/artifact/22TWApbTDaFXAZ9SFJDwQD, 버전 26)의 전체 소스 사본입니다. `dist/` 게임(포근섬)과는 별개이며 GitHub Pages로 배포되지 않습니다.

- 실행: 이 폴더에서 `python3 -m http.server` 후 `http://localhost:8000/` (fetch 사용으로 file:// 불가)
- 시작점: `index.html` (ES 모듈 `src/*.js`, 데이터 `data/*.json`)
- `src/rpg.js`: 전직·스탯·경험치·드랍·강화·탈것·창고 / `src/skills.js`: 상태이상·버프 / `src/gear.js`: 장비·확률표
- `src/entities.js`: 유닛·이동(가속)·발판 착지 / `src/sprite.js`: 스프라이트·절차적 동작
- `illust/`: 일러스트 배경·발판·슬라임·베기 이펙트 / `sprites/`: 도트 시트
- 테스트 스위치: `src/rpg.js`의 `TEST.legendMountFromNormal` (현재 true)
