# 세션 부트 가이드

새 세션은 아래 순서로 컨텍스트를 복구합니다.

## 1. 빠른 사실 확인
- 저장소 목적과 실행 명령은 `README.md`에서 확인합니다.
- 코드 생성 규칙과 아키텍처 규칙은 `CLAUDE.md`, 프로젝트 하네스, 활성 스택 instructions에서 확인합니다. `AGENTS.md`는 같은 기준을 가리키는 보조 진입점입니다.

## 2. 하네스 읽기
1. `../policy/ai-standard-guiding-policy.md`
2. `session-start-alert.md`
3. `project-memory.md`
4. `active-context.md`
5. `decision-log.md`
6. `developer-input-queue.md`
7. `../project/README.md`
8. `../project/project-charter.md`
9. `../project/local-methodology.md`
10. `../project/standards-layers.md`
11. `../project/stack-preset-rules.md`
12. `../project/template-contract.md`
13. `../project/bootstrap.md`
14. `../policy/README.md`
15. `../policy/sync-protocol.md`
16. `../policy/enforcement-ladder.md`
17. `../policy/automation-coverage.md`
18. `../documentation/README.md`
19. `../documentation/indexing-rules.md`
20. `../style/style-evolution.md`
21. `../stacks/README.md` (활성 스택 메타 확인용)

## 3. 작업 시작 전 체크
- `ai-standard-guiding-policy.md`의 위배 여부를 먼저 확인합니다.
- 새 작업이 공통 기준, 스택 기준, 프로젝트 로컬룰 중 어느 계층의 영향을 받는지 먼저 판단합니다.
- 업무 판단, 단순 변환, 외부 연동, 검증 책임이 어느 모듈에 속하는지 먼저 정합니다.
- `developer-input-queue.md`에 `open` 항목이 있으면 개발자 입력이 필요한지 먼저 확인합니다.
- 문서를 추가하거나 확장한다면 먼저 인덱스 문서로 둘지, 세부 문서로 둘지 역할을 결정합니다.
- 방향 유지를 위한 새 장치를 만든다면 harness, trigger, hook 중 어디까지 필요한지 함께 판단합니다.
- 강제 강도와 예외 허용 범위가 애매하면 사용자에게 먼저 확인합니다.
- 스타일 drift가 보이면 `style-evolution.md` 기준으로 문서 규칙 또는 lint 규칙 승격을 검토합니다.

## 4. 빠른 점검 명령
```bash
git --no-pager status --short
npm run policy:impact
npm run harness:check
```

## 5. 작업 재개 원칙
- 현재 진행 상태는 `active-context.md`를 우선 신뢰합니다.
- 장기 규칙은 `project-memory.md`와 `CLAUDE.md`를 우선 신뢰합니다.
- 둘이 충돌하면 `active-context.md`에 충돌 사실을 기록하고 최신 코드 기준으로 다시 정리합니다.
- 기준 문서나 업무 코드를 건드리는 작업이면 `policy:guard`를 시작 전과 종료 전 모두 실행 대상으로 취급합니다.
- 에이전트 작업에서는 로컬 git hook 설치 여부와 무관하게 기준 계층을 읽고 완료 전 `npm run harness:check`를 실행 대상으로 취급합니다.
- 프로젝트 상태나 책임 범위가 `TBD`인 상태라면 새 작업 설계 전에 `project-charter.md` 재계획 여부를 먼저 판단합니다.
- 사용자가 "새 프로젝트 시작" 또는 "기존 프로젝트 하네스 정리" 의사를 보이면 `../project/bootstrap.md`의 절차(프로젝트 상태 확인 + 스택 선택)를 먼저 수행합니다.
- 개발자 입력이 필요한 항목은 묻지 않고 넘기지 말고, 최소한 `지금 답변 / 이번 세션 유보 / 나중에 다시 묻기` 중 하나로 상태를 남깁니다.
- 문서가 길어질 조짐이 있으면 한 문서에 계속 누적하지 말고 `documentation` 하네스 기준으로 분리합니다.
- 반복해서 놓치는 작업은 운영 문서에만 두지 말고 trigger 또는 hook으로 승격할지 검토합니다.
- `inform/trigger/hook/block`와 `none/defer/waiver` 판단이 불명확하면 추정하지 말고 사용자에게 묻습니다.
