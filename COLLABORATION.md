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
