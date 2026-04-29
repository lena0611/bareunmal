# harness-seed

하네스시드는 프로젝트에 개발 기준과 검증 절차를 심는 도구입니다.

AI 에이전트를 쓰든 사람이 직접 개발하든, 프로젝트에는 다음 질문에 대한 답이 필요합니다.

- 이 프로젝트에서 먼저 읽어야 할 기준 문서는 무엇인가?
- 어떤 규칙은 반드시 지켜야 하고, 어떤 규칙은 참고 수준인가?
- 기존 프로젝트의 코드 스타일, 아키텍처, 업무 규칙은 어디에 보존되는가?
- 새로 들어온 개발자나 AI 에이전트가 같은 기준으로 작업하고 있는지 어떻게 확인하는가?

하네스시드는 이 답을 `.harness/` 문서와 `scripts/` 검증 명령으로 정리합니다.

## 한 줄 요약

하네스시드는 기존 프로젝트를 갈아엎는 템플릿이 아니라, 프로젝트 위에 공통 개발 기준과 검증 가능한 작업 절차를 얹는 안전장치입니다.

## 왜 필요한가

AI 에이전트는 코드만 보고도 작업할 수 있지만, 프로젝트의 실제 기준을 자동으로 이해하지는 못합니다.

예를 들어 다음 정보는 코드에 흩어져 있거나 사람 머릿속에만 있는 경우가 많습니다.

- 도메인 용어와 금지해야 할 구현 방식
- 모듈 경계와 의존 방향
- 테스트를 반드시 붙여야 하는 작업 범위
- 세미콜론, quote, import 정렬 같은 스타일 기준
- 릴리스 전 반드시 확인해야 하는 명령
- 기존 팀이 오래 쓰던 로컬 개발 방식

하네스시드는 이런 기준을 문서화하고, 가능한 부분은 `npm run guard` 같은 명령으로 검증합니다.

## 하네스시드가 하는 일

하네스시드는 프로젝트에 다음을 추가합니다.

| 항목 | 역할 |
| --- | --- |
| `.harness/` | 프로젝트 기준, 정책, 세션 문맥, 스택 프리셋을 담는 본체 |
| `.harness/project/local-methodology.md` | 프로젝트 고유 개발방법론의 진입점 |
| `.harness/project/stack-preset-rules.md` | 적용한 스택 프리셋이 프로젝트 로컬룰로 정착되는 문서 |
| `CLAUDE.md` | AI 에이전트가 가장 먼저 읽는 기준 진입점 |
| `AGENTS.md` | Claude가 아닌 에이전트도 같은 기준을 읽게 하는 보조 진입점 |
| `.claude/` | Claude Code용 명령, hook, 보조 에이전트 연결 |
| `.github/` | GitHub Actions, Copilot 지침 등 플랫폼 어댑터 |
| `scripts/` | 정책 검사, 문서 링크 검사, 프로젝트 분석, 스택 적용 명령 |
| `.githooks/` | 커밋 전 검증 연결 |
| `.nvmrc` | 권장 Node 버전 |

중요한 점은 업무 코드 자체를 대신 작성하는 것이 아니라, 작업 기준과 검증 경로를 프로젝트 안에 고정한다는 점입니다.

## 강제되는 것과 강제되지 않는 것

하네스시드는 모든 규칙을 처음부터 강제하지 않습니다. 규칙의 성격에 따라 단계가 다릅니다.

| 단계 | 의미 | 예시 |
| --- | --- | --- |
| 안내 | 사람이 읽고 판단해야 하는 기준 | 프로젝트 목적, 도메인 설명, 작업 원칙 |
| 초안 | 기존 설정이나 문서를 분석해 제안한 기준 | `.editorconfig`, `.eslintrc`에서 추출한 스타일 초안 |
| 로컬룰 | 프로젝트가 선택한 기준 | 프로젝트 고유 방법론, 적용한 스택 프리셋 |
| 검증 | 명령으로 확인 가능한 기준 | 문서 링크, 정책 동기화, lint/test/build |
| 차단 | 통과하지 못하면 커밋이나 CI를 막는 기준 | git hook, CI guard |

따라서 하네스시드는 모든 프로젝트에 같은 스타일을 강제하는 도구가 아닙니다.

예를 들어 기존 프로젝트가 세미콜론을 사용한다면, 하네스시드는 그것을 지우지 않습니다. `.eslintrc`, `.editorconfig`, formatter 설정을 읽고 `Style Rule Draft`로 정리한 뒤, 프로젝트 로컬룰로 승격할 수 있게 합니다.

## 기존 프로젝트에 넣으면 어떻게 되는가

기존 프로젝트에 하네스시드를 설치하면 다음 원칙을 따릅니다.

1. 기존 업무 코드는 덮어쓰지 않습니다.
2. 기존 하네스나 개인 룰 파일이 있으면 먼저 보존합니다.
3. 하네스시드가 만든 파일은 `.harness/install-manifest.json`으로 추적합니다.
4. 출처를 알 수 없는 기존 파일은 기본적으로 프로젝트 소유로 봅니다.
5. 기존 로컬 방법론은 `.harness/project/` 아래 문서와 연결합니다.

즉, 기존 프로젝트의 개발 방식을 삭제하는 것이 아니라 다음처럼 공존시킵니다.

| 기존 프로젝트에 있는 것 | 하네스시드의 처리 |
| --- | --- |
| 기존 코드 스타일 설정 | 스타일 출처로 감지하고 초안 작성 |
| 기존 개인/전용 룰 문서 | 보존하고 브리지 섹션 후보 제안 |
| 기존 아키텍처 규칙 | 로컬 방법론 문서에 연결 |
| 기존 테스트/빌드 명령 | 검증 후보로 감지 |
| 기존 CI | 보존하고 필요한 guard 연결만 검토 |

## 새 프로젝트와 기존 프로젝트

| 상황 | 권장 방식 |
| --- | --- |
| 기존 프로젝트에 기준만 추가 | `init`으로 하네스만 주입 |
| 빈 프로젝트를 새로 시작 | 저장소를 복제한 뒤 스택 프리셋 적용 |
| 이미 팀 전용 하네스가 있음 | 기존 하네스를 보존하고 브리지로 연결 |
| 스타일 기준이 이미 있음 | 설정 파일을 읽어 로컬룰 초안 생성 |
| 스타일 기준이 없음 | 프리셋 후보 중 선택 |

## 가장 흔한 사용법

기존 프로젝트 폴더에서 실행합니다.

```bash
cd my-existing-project
npx -y git+<seed-repo-url>#vX.Y.Z init
npm run hooks:install
npm run guard
```

예시:

```bash
# 사내 GitLab 예시
npx -y git+https://git.example.com/group/harness-seed.git#vX.Y.Z init

# GitHub 예시
npx -y github:<owner>/<repo>#vX.Y.Z init
```

릴리스 태그인 `vX.Y.Z`를 고정해서 쓰는 것을 권장합니다. `main`, `master` 같은 움직이는 브랜치를 쓰면 팀원마다 다른 하네스 버전이 들어갈 수 있습니다.

## 설치 후 먼저 볼 것

```bash
npm run absorb:report
npm run guard
```

`absorb:report`는 현재 프로젝트를 훑고 다음을 리포트로 남깁니다.

- 소스 루트
- 테스트 루트
- 빌드/CI 파일
- formatter/linter 설정
- 스타일 룰 초안
- 기존 룰 문서와 하네스 연결 후보
- 확인이 필요한 질문

`guard`는 현재 하네스 기준으로 문서, 정책, 링크, 적용된 스택 상태를 검사합니다. 스택이 아직 적용되지 않았으면 policy/docs만 검사하고 lint/test/build는 건너뜁니다.

## 주요 명령

| 명령 | 역할 |
| --- | --- |
| `npm run guard` | 통합 검증 |
| `npm run policy:guard` | 정책 영향 분석과 위반 검사 |
| `npm run docs:check` | 문서 레지스트리, 링크, 코드 경로 검사 |
| `npm run absorb:report` | 프로젝트 구조 자동 감지 리포트 생성 |
| `npm run hooks:install` | 로컬 git hook 등록 |
| `npm run templates:list` | 원격 템플릿 후보 조회 |
| `npm run stack:status` | 활성 스택과 적용 상태 확인 |
| `npm run stack:apply` | 활성 스택 scaffold와 로컬룰 적용 |
| `npm run stack:reset` | 적용된 scaffold 제거 |

## 스택 프리셋

스택 프리셋은 특정 기술 스택을 선택했을 때 필요한 scaffold와 규칙 묶음입니다. 하네스시드 본체의 기본값은 `none`이며, 특정 프레임워크를 전제로 하지 않습니다.

| id | 설명 |
| --- | --- |
| `none` | 프레임워크별 검사를 끄고 일반 하네스만 사용 |

본체에는 특정 스택 템플릿을 넣지 않습니다. 기존 프로젝트에 하네스만 얹는 경우에는 `none`으로 시작하고, scaffold까지 필요할 때만 외부 템플릿을 선택합니다.

`stack:apply`는 단순히 파일을 복사하는 데서 끝나지 않습니다. 선택한 스택의 instruction을 `.harness/project/stack-preset-rules.md`에 로컬룰로 기록합니다.

즉, 스택 프리셋은 공통 하네스가 모든 프로젝트에 강제하는 규칙이 아니라, 이 프로젝트가 선택한 기준으로 정착됩니다.

외부 프리셋은 별도 폴더나 저장소로 관리합니다. 일회성 적용은 `npm run stack:apply -- --preset-path ../my-stack-preset` 또는 `npm run stack:apply -- --preset-git <repo-url> --ref <tag-or-branch>`를 사용합니다. 프로젝트에 고정하려면 `.harness/policy/profile.json`의 `stackManifest`에 외부 `manifest.json` 경로를 기록합니다.

사내 GitLab에 `ai-standard/template` 그룹을 만들면 하위 프로젝트를 템플릿 후보로 조회할 수 있습니다.

```bash
npm run templates:list
GITLAB_TOKEN=<private-token> npm run templates:list
```

## init 업데이트 옵션

`init`은 기존 하네스 파일이 있으면 먼저 `.harness-backup/<timestamp>/`에 백업합니다. `.harness/install-manifest.json`으로 하네스시드가 만든 파일인지 판단하고, 관리 파일은 갱신하며, 프로젝트 소유 파일과 출처를 알 수 없는 기존 하네스 파일은 보존합니다.

```bash
npx -y git+<seed-repo-url>#vX.Y.Z init --dry-run
npx -y git+<seed-repo-url>#vX.Y.Z init --force
npx -y git+<seed-repo-url>#vX.Y.Z init --from-git <seed-repo-url> --ref vX.Y.Z
```

보존 대상 예시는 `.harness/project/project-charter.md`, `.harness/project/local-methodology.md`, `.harness/project/stack-preset-rules.md`, `.harness/project/domain-rules.md`, `.harness/project/architecture-rules.md`, `.harness/project/workflow-rules.md`, `.harness/session/active-context.md`, `.harness/policy/profile.json`, `.harness/policy/waivers.json`, `.claude/settings.local.json`입니다.

## Claude Code 어댑터

`.claude/`는 Claude Code 실행 표면을 하네스에 연결하는 선택형 어댑터입니다. 기준 문서와 정책은 계속 `.harness/`에 있고, Claude Code에서는 다음 기능을 추가로 쓸 수 있습니다.

- `/harness-absorb`: 현재 프로젝트를 분석해 `.harness/project`, `.harness/policy`, `.harness/session` 문서에 반영합니다.
- `npm run absorb:report`: `/harness-absorb` 전에 `.harness/session/absorb-report.md`를 생성해 자동 감지 결과를 남깁니다.
- 기존 개인/전용 룰 파일이 보존된 경우 `absorb:report`가 브리지 섹션 추가 후보와 템플릿을 제안합니다.
- `code-reviewer`, `debug-detective`, `test-writer`, `security-auditor`: 하네스 정책을 먼저 읽는 Claude Code 서브에이전트입니다.
- status line과 context hook: 브랜치, dirty 상태, active stack을 짧게 표시합니다.

## Node 버전

- 권장 버전은 `.nvmrc`의 Node `22.14.0`입니다.
- 지원 범위는 `>=20.19.0 || >=22.13.0`입니다.
- 낮은 Node에서 실행하면 하네스 명령이 먼저 업그레이드 안내를 출력합니다.
- 프리셋이 더 높은 Node 버전을 요구하면 해당 프리셋의 `manifest.json` 또는 instruction 문서에 별도로 기록합니다.

## 빈 프로젝트를 새로 시작할 때

하네스 저장소 자체를 복제해 새 프로젝트의 시작점으로 쓸 수 있습니다.

```bash
npx degit <seed-repo-url> my-app
cd my-app
nvm install && nvm use
rm .harness-seed-mode
npm run stack:status
npm run templates:list      # 템플릿이 필요할 때만 조회
npm run stack:apply -- --preset-git <repo-url> --ref <tag-or-branch>
npm install
npm run hooks:install
npm run guard
```

`.harness-seed-mode`는 이 저장소를 하네스 본체로 운영할 때만 남겨두는 마커입니다. 일반 업무 프로젝트로 쓸 때는 삭제합니다.

## 본체 저장소를 운영할 때

이 저장소를 하네스 본체로 계속 관리하는 경우:

- `.harness-seed-mode`를 유지합니다.
- 하네스 본체 변경 후 `npm run guard -- --strict`를 실행합니다.
- seed-mode에서는 `guard`가 init smoke test를 함께 실행합니다.
- 배포는 태그 기준으로 합니다. 예: `v0.2.4`.
- 사내 GitLab처럼 보호 브랜치를 쓰는 저장소에는 fast-forward 가능한 배포 커밋으로 반영합니다.

## AI 에이전트 기준점

사내 표준 에이전트가 Claude라면 `CLAUDE.md`를 기준점으로 둡니다. 다른 에이전트를 쓰더라도 `AGENTS.md`와 `.github/copilot-instructions.md`는 `CLAUDE.md`를 가리키는 보조 진입점입니다.

새 세션은 다음 순서로 읽으면 됩니다.

1. `CLAUDE.md`
2. `.harness/session/README.md`
3. `.harness/session/active-context.md`
4. `.harness/session/next-session-reminder.md`

## 더 읽을 문서

- 이식 절차: `.harness/project/portability-guide.md`
- 새 프로젝트 인터뷰: `.harness/project/bootstrap.md`
- 정책 동기화 모델: `.harness/policy/sync-protocol.md`
- 스택 프리셋 구조: `.harness/stacks/README.md`
