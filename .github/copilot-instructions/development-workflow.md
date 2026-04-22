# Development Workflow

## Development Workflow Rules
1. 항상 로직을 먼저 core에 구현합니다.
2. 그 다음 adapter(Pinia 또는 composable)로 연결합니다.
3. 마지막으로 UI에서 사용합니다.

## Goal
- 프레임워크에 독립적인 비즈니스 로직
- 높은 AI 코드 생성 신뢰성
- 유지보수성과 확장성이 높은 아키텍처
- 다른 프레임워크로의 쉬운 마이그레이션

위 규칙은 코드 생성 및 수정 시 반드시 엄격히 따라야 합니다.
