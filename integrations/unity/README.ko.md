# Unity 캐릭터 드래그 방향 전환

현재 포근섬은 HTML/JavaScript 앱입니다. 이 C# 스크립트는 별도의 Unity 프로젝트에서 사용하며 웹 앱이 Unity로 전환되는 것은 아닙니다.

1. `CharacterDragFacing.cs`를 Unity 프로젝트의 Assets/Scripts에 넣습니다. 파일명과 클래스명을 동일하게 유지합니다.
2. UI 방식: Canvas 안에 캐릭터 Image를 만들고 스크립트를 추가합니다. Image의 Raycast Target을 켜고 Canvas에 GraphicRaycaster를 둡니다. UI Image 항목에 그 Image를 연결합니다. Image의 Preserve Aspect를 켜서 캐릭터가 찌그러지지 않게 합니다.
3. 씬에 EventSystem을 둡니다. 기존 Input Manager는 StandaloneInputModule, 새 Input System은 InputSystemUIInputModule을 사용합니다. 두 모듈을 동시에 켜지 않습니다. 스크립트는 포인터 이벤트를 사용하므로 입력 패키지를 직접 참조하지 않습니다.
4. SpriteRenderer 방식: 캐릭터에 Collider2D와 스크립트를 추가하고 카메라에 Physics2DRaycaster를 추가합니다. EventSystem도 필요합니다. Sprite Renderer에 대상 렌더러를 연결합니다. 레이어와 레이캐스트 마스크를 맞춥니다.
5. Direction Sprites 배열에 정면부터 시계 방향으로 넣습니다. 4장일 때는 **정면 → 오른쪽 → 뒷면 → 왼쪽**입니다. 기존 포근섬 배열 순서(정면/뒷면/왼쪽/오른쪽)와 다르므로 재배열합니다. 모든 이미지의 캔버스 크기와 발 기준점을 동일하게 맞춥니다.
6. Direction 모드는 시작 터치점에서 끌어간 방향을 바라봅니다. 화면 아래=정면, 오른쪽=오른쪽, 위=뒷면, 왼쪽=왼쪽입니다. 손을 떼면 마지막 방향을 유지합니다. Sensitivity와 Turn Speed로 따라오는 속도를 조절합니다.
7. Orbit 모드는 좌우 드래그로 캐릭터를 둘러봅니다. Sensitivity=1이면 화면 너비만큼 끌 때 360도입니다. Dead Zone은 작은 손 떨림을 무시합니다. 회전 영역을 캐릭터 Image/Collider 범위에 한정하므로 옷 구매·해제 버튼 입력과 분리됩니다.

각도는 연속적인 0~360도로 계산하지만 4장의 그림만 있으면 4방향으로 표시됩니다. 촘촘한 회전 느낌은 8/16/32방향 원화가 필요합니다. 정면 한 장을 돌려서 뒷모습을 만들 수는 없습니다. 의상을 바꿀 때에는 같은 순서의 착용 스프라이트 세트를 연결해야 합니다. Z축 회전으로 캐릭터가 옆으로 눕는 처리는 하지 않습니다.

검증: 소스 구조/입력 흐름 검토. 이 저장소에는 Unity 에디터나 프로젝트가 없으므로 Unity 컴파일 및 실제 휴대폰 검수는 미실시입니다.
