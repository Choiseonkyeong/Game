# 포근섬55 검수·배포 인계

- Base: master@aefd8ffb0497a633d212879343aa210a7ccf03e5; branch codex/pogeun-review55.
- User explicitly approved uploading these source/test changes to Choiseonkyeong/Game and deploying, after the previous auto-review rejection. Approval received before upload.
- Changes: Arrow/WASD movement with normalized diagonals, collision/boundary checks and saved position; pause pointer movement behind dialogs; uniform outdoor camera-size compensation; existing room artwork with uniform 1.2x character size and keyboard release stop; first visitor ~20s, subsequent 60–90s, no overlapping async sprite loads; cache55.
- Preserved: all artwork, CSS, fonts, approved wardrobe/shop frames, balance and save schema. No new clothing art or seed-shop redesign is included. Existing growth/wardrobe/Lv4 progression checked through regression tests.
- Checks before publication: 75 island tests passed, 0 failed; active island JS syntax checks passed.
- Source: master@b77e75e59daedfe74813aea87774f838d948229e; task branch codex/pogeun-review55; base aefd8ffb0497a633d212879343aa210a7ccf03e5.
- Deployment: Pages run 40831952402 completed/success; https://choiseonkyeong.github.io/Game/island/; public build-info exact source; built_at 2026-10-29T06:53:36.479Z; checked 2026-10-29T15:59:51+09:00.
- Observed verification: GitHub Pages40831952402 success, all156 tests pass/0 fail. Public build-info exact b77e75e59daedfe74813aea87774f838d948229e, built_at2026-10-29T06:53:36.479Z. Chrome island.js?v55; keyboard outdoor489.57120480000043,470 saved/reloaded exactly; room enter/keyboard/exit and original art scale1.2 checked; knit equip/save/reload and look1 preserved; starter harvest0->150shells/Lv2, paid expansion150->0/Lv3; same character image143.1484x206.4000px before and after Lv3(scale1.08), crop3/5 retained after reload; visiting chihuahua observed; no game-origin console errors.
- Remaining verification limits: Actual iPhone/touch, offline runtime, full Lv4 livestock lifecycle and Lv8–10 live playthrough unverified; external collaborator access not confirmed. Existing seed-shop and wardrobe art preserved; no new clothing art or seed-shop redesign in this patch.
- Earlier chat's pogeun55-changes.zip was unavailable; this is a small patch from the current master, not a restore from that unavailable archive.
