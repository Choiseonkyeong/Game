# Codex / Claude 공용 작업 기준

## 단일 원본
- 공용 저장소: https://github.com/Choiseonkyeong/Game
- 기본 브랜치: master
- 서비스 파일: dist/
- 작업자는 수밍과 별도 사람/계정일 수 있다. 수밍 개인 로그인으로만 열리는 주소를 공용 주소라고 보고하지 않는다.
- 작업 전 원격 master를 확인하고 상대 변경을 보존한다. 동시에 수정한 내용은 통합하고 강제 푸시하지 않는다.

## GitHub Pages 배포
목표 공용 URL: https://choiseonkyeong.github.io/Game/

상태: Pages 활성화 및 실제 배포 성공을 확인하기 전에는 접속 완료라고 안내하지 않는다. 기존 Sites는 공개 설정이지만 외부 접속 실패가 보고되었다.

저장소 관리자에게 필요한 1회 설정:
1. https://github.com/Choiseonkyeong/Game/settings/pages
2. Build and deployment → Source → GitHub Actions
3. https://github.com/Choiseonkyeong/Game/actions 에서 Publish shared game → Run workflow

연결된 GitHub 도구는 파일·커밋 변경을 지원하지만 Pages 설정을 변경하는 관리 API는 제공하지 않는다. 개인 토큰을 코드/문서/대화에 요구하거나 저장하지 않는다.

자동 배포: .github/workflows/pages.yml
- master의 dist, test, package.json, 배포 workflow 변경 시 실행
- npm test 통과 후 dist를 GitHub Pages에 게시
- Codex와 Claude 모두 GitHub의 같은 배포 경로를 사용한다.
- 배포 권한은 workflow의 기본 GITHUB_TOKEN과 OIDC를 사용하며 개인 Sites 토큰이 필요 없다.
- build-info.json에 실제 배포 커밋을 기록한다.
- Pages 활성화 후 첫 workflow가 실패했다면 Actions에서 실패 원인을 확인하고 재실행한다.

## 확인
Pages 주소와 build-info.json을 외부에서 확인한 뒤에만 배포 완료라고 보고한다. AI의 URL-fetch 차단과 실제 사용자 브라우저의 로그인/403/404 오류를 구분한다. 다른 작업자의 접속 성공을 직접 확인하지 않았다면 보장하지 않는다.

게임 진행은 기기별 localStorage이므로 같은 코드라도 단계는 다를 수 있다. 타인의 진행을 임의로 초기화하지 않는다.


## 작업 전 공통 스킬
[skills/guard-shared-game/SKILL.md](skills/guard-shared-game/SKILL.md)를 모든 게임 수정·복구·병합·배포에 적용합니다. Codex는 AGENTS.md, Claude는 CLAUDE.md와 프로젝트 스킬 안내에서 같은 원문을 읽습니다.

GitHub 체크아웃 시작: `python skills/guard-shared-game/scripts/preflight.py --repo . --phase start`
저장/병합 직전: `python skills/guard-shared-game/scripts/preflight.py --repo . --phase finish`

이 검사는 원격 master 확인과 오래된 브랜치 탐지용입니다. 게임 수정, 강제 초기화, 커밋, 푸시는 하지 않습니다. Sites 체크아웃은 다른 저장소이므로 검사 대신 GitHub 커넥터에서 최신 커밋/트리를 비교하고 최신 소스를 동기화합니다.

[.collaboration/release-state.json](.collaboration/release-state.json)은 마지막 확인 배포본과 공용 URL 미해결 상태를 구분합니다. 기록만 보고 오늘도 최신이라고 단정하지 않습니다. 게임 파일이 같은 문서 커밋과 실제 게임 변경도 구분합니다. 정상 배포 후에는 기록과 작업 인계 내용을 갱신합니다.

커밋/PR 인계에는 소스 SHA, 반영 내용, 검사 결과, 실제 배포 버전과 URL, 접속 확인 방법/한계, 미완료 사항을 남깁니다. 서로 다른 작업자의 계정·로컬 진행은 공유되지 않으며, 이 채팅을 자동으로 읽었다고 가정하지 않습니다.

## 시간별 업데이트 기록

모든 작업자는 수정·복구·병합·배포·실패 또는 보류가 생길 때 [UPDATE_LOG.md](UPDATE_LOG.md)에 한국 시간(Asia/Seoul, UTC+09:00)으로 이력을 추가한다. 날짜·시각, 작업자, 요청/변경 내용, 소스 커밋, 검사 결과, 배포 상태·버전·URL, 남은 사항을 적는다. 기존 항목을 삭제하거나 새 요약으로 덮어쓰지 않고 최신 항목을 위에 추가한다. 과거 시각을 추정하지 말고 확인된 커밋/배포 시각을 사용하며, 시각이 불명확하면 미확인이라고 표시한다. 소스 저장과 배포 성공을 구분하고 다른 작업자의 접속을 확인하지 않았으면 그대로 적는다. 작업 전 최신 로그를 읽고, 소스 커밋 확정 후 별도 기록 커밋으로 SHA를 남길 수 있다.
