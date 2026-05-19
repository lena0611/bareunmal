# Changelog

하네스 본체의 릴리스 변경사항을 기록합니다.

`CHANGELOG.md`는 하네스 본체 변경 이력입니다. 설치된 소비자 프로젝트의 판단 기록은 `.harness/session/decision-log.md`에 남깁니다.

## 0.2.33 - 2026-05-19

- 사용자-facing 용어를 “공통 하네스” 중심으로 정리하고 용어 문서를 추가했습니다.
- Claude Code `SessionStart` hook으로 `next-session-reminder.md`를 자동 표시합니다.
- `/reminder`, `/memory`, `/decision` slash command를 추가해 세션 리마인더, 프로젝트 메모리, 결정 로그 갱신 경로를 명시했습니다.
- Codex와 Copilot은 같은 hook 강제성이 없음을 문서화하고, `CLAUDE.md` 읽기 순서와 대상 파일을 기준으로 안내합니다.
- 프로젝트 `.nvmrc`가 하네스 실행 최소 Node보다 낮으면 설치를 중단하도록 정리했습니다.

## 0.2.32 - 2026-05-18

- 공통 하네스만 설치된 상태를 정상 선택 가능한 상태로 안내합니다.
- 설치 완료 안내, 인수인계 요약, 대시보드에 다음 선택지를 추가했습니다.
- 개발자가 스택 후보 적용, 공통 기준 단독 운영, 새 스택 하네스 후보 요청 중 하나를 바로 선택할 수 있게 했습니다.
- 본체 GitHub Actions workflow는 소비자 프로젝트 설치 대상과 npm 패키지 포함 대상에서 제외했습니다.

## 0.2.31 - 2026-05-18

- 설치 후 일상 명령 안내를 `npm run harness:*` 중심으로 정리했습니다.
- `ai-standard-cli`는 최초 설치와 스택 선택을 돕는 bootstrap/router로 두고, 소비자 프로젝트의 상시 사용 표면은 npm script로 고정했습니다.

## 0.2.30 - 2026-05-18

- 설치 후 안내에서 프로젝트 로컬 CLI 실행 방식을 실험했습니다.
- 이 방향은 0.2.31에서 폐기하고 `npm run harness:*` 중심 안내로 되돌렸습니다.

## 0.2.29 - 2026-05-18

- `--force` 단독 실행 시 프로젝트 소유 파일 덮어쓰기 위험을 안내하고 중단하도록 변경했습니다.
- 실제 덮어쓰기는 `--force --confirm-overwrite-project-files`로 위험 인지를 명시해야 진행됩니다.
- `harness:update`에서도 같은 확인 규칙을 적용했습니다.

## 0.2.28 - 2026-05-18

- 소비자 프로젝트에 본체 세션 기록이 복사되지 않도록 분리했습니다.
- `active-context.md`, `decision-log.md`, `developer-input-queue.md`, `next-session-reminder.md`, `project-memory.md`는 설치 시 소비자 프로젝트용 템플릿으로 생성합니다.
- 과거 버전에서 본체 세션 문서가 그대로 복사되었고 사용자가 수정하지 않은 경우, 업데이트 시 소비자 프로젝트용 템플릿으로 교체합니다.
- 소비자 프로젝트의 `decision-log.md`가 릴리스 노트가 아니라 프로젝트별 기준 충돌과 선택 이유를 기록하는 문서임을 명확히 했습니다.
