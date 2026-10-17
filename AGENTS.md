# Game — Codex / Claude 공통 작업 규칙

모든 게임 수정·복구·병합·배포 작업 전에 [공동 작업 보호 스킬](skills/guard-shared-game/SKILL.md)을 읽고 적용한다. 작업자마다 다른 사람/계정일 수 있다.

1. 원본은 `Choiseonkyeong/Game`의 최신 원격 `master`다. 대화 기억이나 오래된 개인 브랜치를 기준으로 덮어쓰지 않는다.
2. 작업 전 원격 HEAD·현재 브랜치·미저장 변경과 [.collaboration/release-state.json](.collaboration/release-state.json)을 확인한다. 배포 기록은 시점 정보이므로 실제 상태를 재확인한다.
3. GitHub 체크아웃에서는 `python skills/guard-shared-game/scripts/preflight.py --repo . --phase start`를 실행한다. 오래된 브랜치는 먼저 최신 master를 통합하거나 새 worktree로 옮긴다. 기존 작업을 지우거나 강제 초기화하지 않는다. GitHub 커넥터만 쓸 때는 스킬에 적힌 동등한 원격 비교를 수행한다.
4. 실제 `dist/index.html`과 import를 따라 활성 소스를 확인한다. v0.6.3에서는 `play.js`가 시작점이다. 남아 있는 예전 `app.js` 등을 현재 게임으로 오인하지 않는다.
5. 수정 직전 최신 파일을 읽고 필요한 패치만 적용한다. 저장·병합 직전에 원격 변경을 다시 확인한다. API ref 갱신은 `expected_sha`와 `force:false`를 사용한다. 다른 작업자의 변경을 강제 푸시/옛 전체 파일로 덮어쓰지 않는다.
6. 소스 저장, 검사 통과, 배포 성공, 외부 작업자 접속, 실제 휴대폰 검수는 각각 별도 상태다. 확인하지 않은 상태를 완료라고 보고하지 않는다.
7. 소스 복구 요청에서 URL 보존 지시가 있으면 주소·배포·접근 설정과 무관한 파일을 유지하고 요청한 게임 소스만 복구한다. 커밋 이력을 삭제하지 않는다.
8. 공동 URL과 배포 경로는 `COLLABORATION.md` 및 release-state 기록을 따른다. URL을 임의로 새로 만들거나 개인 ChatGPT 계정을 공용 작업의 필수 조건으로 삼지 않는다.
9. 정상 배포 후 실제 소스·버전·URL·검증 근거를 release-state에 기록한다. 상대 작업자가 이 채팅을 읽었거나 로컬 브랜치를 자동 갱신했다고 가정하지 않는다.

규칙은 저장소에서 공유한다. 이 문서와 스크립트는 서버의 모든 쓰기를 자동 차단하는 잠금이 아니다. 각 도구가 최신 저장소를 받아 규칙을 읽고 검사해야 한다.
