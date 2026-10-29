# 포근섬55 검수·배포 인계

- Base: master@aefd8ffb0497a633d212879343aa210a7ccf03e5; branch codex/pogeun-review55.
- User explicitly approved uploading these source/test changes to Choiseonkyeong/Game and deploying, after the previous auto-review rejection. Approval received before upload.
- Changes: Arrow/WASD movement with normalized diagonals, collision/boundary checks and saved position; pause pointer movement behind dialogs; uniform outdoor camera-size compensation; existing room artwork with uniform 1.2x character size and keyboard release stop; first visitor ~20s, subsequent 60–90s, no overlapping async sprite loads; cache55.
- Preserved: all artwork, CSS, fonts, approved wardrobe/shop frames, balance and save schema. No new clothing art or seed-shop redesign is included. Existing growth/wardrobe/Lv4 progression checked through regression tests.
- Checks before publication: 75 island tests passed, 0 failed; active island JS syntax checks passed.
- Current publication: pending; public browser QA, actual phone touch and offline runtime are not claimed verified. Update the deployment record after the actual Pages run and public UI check.
- Earlier chat's pogeun55-changes.zip was unavailable; this is a small patch from the current master, not a restore from that unavailable archive.
