# Copilot Instructions

GitHub Copilot용 shim입니다. 기준 진입점은 루트의 `CLAUDE.md`입니다.

먼저 [CLAUDE.md](../CLAUDE.md)를 읽고, 필요한 세부 문서는 아래 목차를 사용합니다.

## 목차
- 프로젝트 개요: 추가 예정 (`.harness/project/project-charter.md`)
- [코딩 컨벤션](./copilot-instructions/coding-conventions.md)
- [Project Setup](./copilot-instructions/project-setup.md)
- [Development Workflow](./copilot-instructions/development-workflow.md)
- [Session Harness](../.harness/session/README.md)
- [Project Harness](../.harness/project/README.md)
- [Project Bootstrap](../.harness/project/bootstrap.md)
- [Policy Harness](../.harness/policy/README.md)
- [Documentation Harness](../.harness/documentation/README.md)
- [Style Harness](../.harness/style/README.md)
- [Stacks](../.harness/stacks/README.md)

## 활성 스택 instruction
기본값은 `activeStack=none`입니다. 외부 프리셋을 적용한 프로젝트에서는 `.harness/project/stack-preset-rules.md`와 `profile.json`의 `stackManifest`를 확인합니다.
