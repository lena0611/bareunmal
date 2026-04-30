# 동기화 프로토콜

## 언제 반드시 실행하는가
- `.github/copilot-instructions/**`가 바뀔 때
- `.claude/**` 어댑터가 바뀔 때
- `.harness/policy/**`가 바뀔 때
- `src/**`가 바뀔 때
- 구조, 상태 관리, feature 경계에 영향을 줄 수 있는 리팩터링을 할 때
- `scripts/init.mjs`, `scripts/test-init.mjs`, `scripts/absorb-project.mjs` 또는 문서 검사 스크립트가 바뀔 때

## 기본 실행 순서
1. `npm run policy:impact`
2. `npm run policy:check`
3. 필요 시 관련 기준 문서와 영향 영역을 함께 수정
4. `npm run docs:check`로 문서 링크와 레지스트리 일관성 확인
5. 최종 확인은 `npm run harness:check` (CI에서는 `npm run harness:check:strict`)

## SYNC GAP 처리
- `policy:impact` 출력에 `SYNC GAP detected` 블록이 보이면 한쪽(문서 또는 소스)만 변경된 상태라는 뜻입니다.
- 기본 동작: 갭은 경고 수준이며 로컬 `harness:check`는 실패시키지 않습니다.
- CI(`policy-guard.yml`)는 `--strict`를 사용하므로 갭이 남아 있으면 실패합니다.
- 해결 옵션:
  1. 반대편을 같이 갱신해 갭을 닫는다.
  2. 의도된 단방향 변경이면 `decision-log.md`에 사유를 남기고 필요 시 `waivers.json`에 등록한다.
  3. 기준 매핑이 잘못된 경우 `policy-registry.json`의 `documents`/`ownedAreas`를 수정한다.

## 세션 트리거
- 새 세션 시작 시 `session-boot.md`를 읽은 직후 이 프로토콜을 확인합니다.
- 개발 기준 또는 소스 코드를 손대는 작업을 시작하면 `policy:guard`를 먼저 떠올립니다.
- 작업 완료 전에도 `policy:guard`를 다시 실행해 최종 위반이 없는지 확인합니다.

## 해석 원칙
- `policy:impact`는 "어디를 다시 봐야 하는지" 알려줍니다.
- `policy:check`는 "지금 바로 위반인지"를 알려줍니다.
- `policy:impact`가 출력한 영역이 넓더라도, 검토 대상에서 제외하지 않습니다.
- 자동 검사로 다 잡히지 않는 항목은 `automation-coverage.md`와 `waivers.json` 기준으로 추가 판단합니다.

## 어댑터와 설치 스크립트
- `.harness/`는 단일 진실 출처입니다. `.claude/`와 `.github/`는 플랫폼 어댑터로만 둡니다.
- 새 어댑터 문서를 추가하면 `document-registry.json`과 `scripts/doc-link-check.mjs`의 탐색 범위를 함께 확인합니다.
- `init`은 하네스 소유 파일을 갱신하고 프로젝트 소유 파일을 보존해야 합니다.
- `init`은 `.harness/install-manifest.json`으로 하네스시드가 관리하는 파일을 식별해야 합니다.
- manifest가 없는 기존 `.harness/`, `.claude/`, `CLAUDE.md`는 전용 하네스일 수 있으므로 기본 보존하고 `--force`일 때만 덮어씁니다.
- 프로젝트 소유 파일 예시는 `.harness/project/project-charter.md`, `.harness/project/local-methodology.md`, `.harness/project/stack-preset-rules.md`, `.harness/project/domain-rules.md`, `.harness/project/architecture-rules.md`, `.harness/project/workflow-rules.md`, `.harness/session/active-context.md`, `.harness/policy/profile.json`, `.harness/policy/waivers.json`, `.claude/settings.local.json`입니다.
- `stack:apply`는 활성 스택 instructions를 `.harness/project/stack-preset-rules.md`에 로컬룰로 반영해야 합니다.
- 외부 프리셋은 `profile.json`의 `stackManifest` 또는 `stack:apply -- --preset-path <dir>`로 연결하며, manifest 상대 경로는 manifest 위치 기준으로 해석합니다.
- 원격 템플릿 후보 조회는 `scripts/list-templates.mjs`가 담당하며, 기본 대상은 사내 GitLab의 `ai-standard/template` 그룹입니다.
- 세미콜론, quote, import 정렬 같은 구체 스타일 값은 공통 하네스가 아니라 로컬 방법론 또는 스택 프리셋 로컬 규칙에서 다룹니다.
- 설치/업데이트 UX가 바뀌면 README의 init 사용법과 보존 기준 설명도 함께 갱신합니다.
- `scripts/absorb-project.mjs`는 자동 감지 리포트까지만 생성하고, 프로젝트 기준 문서를 직접 덮어쓰지 않습니다.
- `.harness/session/absorb-report.md`는 런타임 산출물이므로 레지스트리 필수 문서로 보지 않습니다.
