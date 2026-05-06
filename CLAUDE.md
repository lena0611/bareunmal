# CLAUDE

이 파일이 모든 에이전트의 기준 진입점입니다. 사내 표준 에이전트는 Claude입니다.

## 읽기 순서
1. `.harness/policy/ai-standard-guiding-policy.md`
2. `.harness/session/README.md`
3. `.harness/session/session-start-alert.md`
4. `.harness/session/project-memory.md`
5. `.harness/session/active-context.md`
6. `.harness/project/project-charter.md`
7. `.harness/project/local-methodology.md`
8. `.harness/project/standards-layers.md`
9. `.harness/project/stack-preset-rules.md`
10. `.harness/project/domain-rules.md`
11. `.harness/project/architecture-rules.md`
12. `.harness/project/workflow-rules.md`
13. `.harness/project/bootstrap.md`
14. `.harness/policy/README.md`
15. `.harness/documentation/README.md`
16. `.harness/stacks/README.md`

## 기준
- 하네스 본체는 `.harness/`에 있습니다.
- `.github/`는 GitHub Copilot, GitHub Actions, GitHub template용 어댑터입니다.
- `.claude/`는 Claude Code hooks, agents, slash command용 어댑터입니다.
- `AGENTS.md`와 `.github/copilot-instructions.md`는 이 파일을 가리키는 보조 진입점입니다.
- 개발 기준, 세션, 문서, 스택 기준은 `.harness/`를 단일 진실 출처로 봅니다.

## 작업 원칙
- 모든 작업은 먼저 `.harness/policy/ai-standard-guiding-policy.md` 위배 여부를 확인합니다.
- 작업 전 `npm run harness:check` 또는 최소 `npm run policy:impact`로 영향 범위를 확인합니다.
- 개발 기준 문서, 스택 문서, `src/`를 변경하면 관련 반대편 문서/코드도 함께 검토합니다.
- 에이전트 작업에서는 로컬 git hook 설치 여부와 무관하게 기준 계층을 따르고 완료 전 검사를 실행 대상으로 둡니다.
- 새 프로젝트 방향이 비어 있으면 구현보다 `.harness/project/bootstrap.md` 인터뷰를 먼저 진행합니다.
