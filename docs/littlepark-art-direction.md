# 작은 정원 0.2 — 추구미와 제작 기록

사용자 요청: 퍼피레드에서 좋아했던 미니파크 꾸미기와 동식물 키우기. 단순 기능 테스트를 넘어 정이 드는 공간, 통일된 사물 비율과 디테일, 가독성, 게임 화면 집중.

이번 방향: 크림·세이지·복숭아의 따뜻한 색, 둥근 지붕과 나무·도자기·흙의 재질, 같은 조명/시점의 입체 스프라이트. 정원이 화면 중심이고 설명과 도구는 하단의 작은 층으로 제한. 새 원화는 특정 게임의 캐릭터나 자산을 복제하지 않은 독자 디자인.

## 원화

Built-in image_gen 사용. CLI/API키 미사용. 원본 PNG는 generated_images에 보존, 배포에는 알파를 유지한 WebP 형식 변환만 사용. 스프라이트 분리는 이미지 편집 없이 SVG viewBox로 실행.

- `dist/littlepark/garden-atlas.webp`: 1536×1024, 별도 물체를 담은 4×3 아틀라스. 집, 벤치, 데이지, 튤립, 라벤더, 빈 화분, 연못, 사과나무, 티 테이블, 물그릇, 방석, 정원등. 실제 생성 배치에 맞춘 수동 viewBox.
- `dist/littlepark/momo-atlas.webp`: 1254×1254, 동일 크림·진저 고양이의 걷기/앉기/수면/물그릇 자세. 물그릇이 그림에 중복된 네 번째 자세는 실제 정원에 사용하지 않는다. 모델 리깅이 아닌 투명 이미지 자세 전환이다.

핵심 프롬프트: original cozy miniature garden game, orthographic isometric camera 30 degrees, upper-left soft sunlight, rounded tactile soft clay/vinyl 3D renders, cream/sage/peach/honey wood, isolated objects and genuine transparent backgrounds, no text/logos/UI. Same lighting/camera/materials for all furniture. Cat: same cream-and-ginger kitten in four distinct poses, green collar and small bell, separate complete bodies.

## 행동과 보존

모모는 집/사물을 피하는 격자 경로를 걷고 물그릇/꽃 곁에 머물며 벤치/방석에서 쉰다. 실제 다리 프레임 애니메이션이나 범용 AI가 아니라 경로 보간+자세 전환이다. 모션 줄이기 설정에서는 이동 애니메이션을 멈춘다. 쓰다듬기와 간식 쿨다운, 세 가지 분위기 테마, 식물 개화와 오프라인 성장. 기존 저장키/가구 배치/심은 식물/친밀도 보존. 사진관 및 기존 게임은 수정하지 않는다.

온라인 계정/친구 방문/다수 동물/장기 경제/상용 완성은 이번 범위 밖. 배포 및 실제 검수 결과는 UPDATE_LOG와 release-state 기록을 따른다.
