# harness-seed

하네스시드는 프로젝트에 개발 기준과 검증 절차를 심는 도구입니다.

AI 에이전트를 쓰든 사람이 직접 개발하든, 프로젝트에는 다음 질문에 대한 답이 필요합니다.

- 이 프로젝트에서 먼저 읽어야 할 기준 문서는 무엇인가?
- 어떤 규칙은 반드시 지켜야 하고, 어떤 규칙은 참고 수준인가?
- 기존 프로젝트의 코드 스타일, 아키텍처, 업무 규칙은 어디에 보존되는가?
- 새로 들어온 개발자나 AI 에이전트가 같은 기준으로 작업하고 있는지 어떻게 확인하는가?

하네스시드는 이 답을 `.harness/` 문서와 `scripts/` 검증 명령으로 정리합니다.

## 한 줄 요약

하네스시드는 기존 프로젝트를 갈아엎는 템플릿이 아니라, 회사 공통 기준을 내부 베이스로 깔고 프로젝트가 선택한 스택 기준과 검증 절차를 얹는 설치 엔진입니다.

## 왜 필요한가

AI 에이전트는 코드만 보고도 작업할 수 있지만, 프로젝트의 실제 기준을 자동으로 이해하지는 못합니다.

예를 들어 다음 정보는 코드에 흩어져 있거나 사람 머릿속에만 있는 경우가 많습니다.

- 도메인 용어와 금지해야 할 구현 방식
- 모듈 경계와 의존 방향
- 테스트를 반드시 붙여야 하는 작업 범위
- 세미콜론, quote, import 정렬 같은 스타일 기준
- 릴리스 전 반드시 확인해야 하는 명령
- 기존 팀이 오래 쓰던 로컬 개발 방식

하네스시드는 이런 기준을 문서화하고, 가능한 부분은 `npm run harness:check` 같은 명령으로 검증합니다.

## 하네스시드가 하는 일

하네스시드는 프로젝트에 다음을 추가합니다.

| 항목 | 역할 |
| --- | --- |
| `.harness/` | 회사 공통 기준 참조, 프로젝트 기준, 검증 기준, 세션 문맥을 담는 본체 |
| `.harness/project/local-methodology.md` | 프로젝트 고유 개발방법론의 진입점 |
| `.harness/project/stack-preset-rules.md` | 선택한 스택 기준이 프로젝트 로컬룰로 정착되는 문서 |
| `CLAUDE.md` | AI 에이전트가 가장 먼저 읽는 기준 진입점 |
| `AGENTS.md` | Claude가 아닌 에이전트도 같은 기준을 읽게 하는 보조 진입점 |
| `.claude/` | Claude Code용 명령, hook, 보조 에이전트 연결 |
| `.github/` | GitHub Actions, Copilot 지침 등 플랫폼 어댑터 |
| `scripts/` | 기준 동기화 검사, 문서 링크 검사, 프로젝트 분석, 스택 적용 명령 |
| `.githooks/` | 커밋 전 검증 연결 |
| `.nvmrc` | 권장 Node 버전 |

중요한 점은 업무 코드 자체를 대신 작성하는 것이 아니라, 작업 기준과 검증 경로를 프로젝트 안에 고정한다는 점입니다.

## 강제되는 것과 강제되지 않는 것

하네스시드는 모든 규칙을 처음부터 강제하지 않습니다. 규칙의 성격에 따라 단계가 다릅니다.

| 단계 | 의미 | 예시 |
| --- | --- | --- |
| 안내 | 사람이 읽고 판단해야 하는 기준 | 프로젝트 목적, 도메인 설명, 작업 원칙 |
| 초안 | 기존 설정이나 문서를 분석해 제안한 기준 | `.editorconfig`, `.eslintrc`에서 추출한 스타일 초안 |
| 로컬룰 | 프로젝트가 선택한 기준 | 프로젝트 고유 방법론, 적용한 스택 기준 |
| 검증 | 명령으로 확인 가능한 기준 | 문서 링크, 기준-코드 동기화, lint/test/build |
| 차단 | 통과하지 못하면 커밋이나 CI를 막는 기준 | git hook, CI check |

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
| 기존 CI | 보존하고 필요한 check 연결만 검토 |

## 새 프로젝트와 기존 프로젝트

| 상황 | 권장 방식 |
| --- | --- |
| 기존 프로젝트에 회사 기준 적용 | `init` 후 스택 기준을 선택하고 기존 프로젝트 기준과 충돌 여부 확인 |
| 빈 프로젝트를 새로 시작 | 스택 기준을 선택한 뒤 필요한 scaffold 템플릿 적용 |
| 이미 팀 전용 하네스가 있음 | 기존 하네스를 보존하고 브리지로 연결 |
| 스타일 기준이 이미 있음 | 설정 파일을 읽어 로컬룰 초안 생성 |
| 스타일 기준이 없음 | 프리셋 후보 중 선택 |

## 가장 흔한 사용법

기존 프로젝트 폴더에서 실행합니다. 사내 GitLab 기준으로는 아래 명령이 기본입니다.

```bash
cd my-existing-project
npx -y git+https://git.smartscore.kr/ai-standard/harnesses/harness-seed.git#v0.2.10 init
```

`init`은 설치 직후 자동으로 `harness:doctor`와 `harness:check`를 실행합니다. 사용자는 먼저 생성된 `.harness/session/absorb-report.md`를 보고, 스택 기준 선택 여부와 충돌 후보를 확인한 뒤 필요한 경우 git hook, 스택 기준, scaffold 템플릿을 선택합니다.

```bash
npm run hooks:install
npm run standards:list
npm run stack:apply -- --preset-git https://git.smartscore.kr/ai-standard/harnesses/vue3-vite-pinia-router.git --ref v0.1.2

# scaffold 템플릿이 필요한 경우에만 조회
npm run templates:list
```

다른 저장소 위치를 쓰는 경우:

```bash
npx -y git+https://git.example.com/group/harness-seed.git#vX.Y.Z init
npx -y github:<owner>/<repo>#vX.Y.Z init
```

하네스시드는 계속 개선되므로 `main`, `master` 같은 움직이는 브랜치를 따라가며 최신 변경을 빠르게 받는 방식도 가능합니다. 다만 팀 프로젝트에서는 하네스 변경이 언제 들어왔는지 추적할 수 있도록 릴리스 태그인 `vX.Y.Z`를 고정해 주입하는 것을 권장합니다. 최신 버전으로 올릴 때는 새 태그로 다시 `init`을 실행하고, 생성된 변경분과 `harness:doctor`, `harness:check` 결과를 함께 확인합니다.

## 설치 후 먼저 볼 것

`init`은 설치가 끝나면 기본적으로 현재 프로젝트를 진단하고, 하네스 설치 상태를 검사합니다. 그래서 일반적인 설치에서는 아래 명령을 따로 실행하지 않아도 됩니다. 프로젝트 상태를 다시 확인하고 싶을 때 같은 명령을 다시 실행합니다.

```bash
npm run harness:doctor
npm run harness:check
```

`harness:doctor`는 현재 프로젝트를 훑고 `.harness/session/absorb-report.md`를 생성합니다.

- 소스 루트
- 테스트 루트
- 빌드/CI 파일
- formatter/linter 설정
- 스타일 룰 초안
- 회사/스택/프로젝트/개인 기준 계층
- 기준 충돌 후보
- 기존 룰 문서와 하네스 연결 후보
- 확인이 필요한 질문

`harness:check`는 현재 하네스 기준으로 문서, 검증 기준, 링크, 적용된 스택 상태를 검사합니다. 스택이 아직 적용되지 않았으면 기준 동기화와 문서 검사만 실행하고 lint/test/build는 건너뜁니다.

이전 명령인 `npm run absorb:report`와 `npm run guard`도 계속 동작하지만, 새 문서에서는 `harness:doctor`, `harness:check`를 기준으로 설명합니다.

## 주요 명령

| 명령 | 역할 |
| --- | --- |
| `npm run harness:doctor` | 현재 프로젝트 진단 리포트 생성 |
| `npm run harness:check` | 하네스 기본 검사 |
| `npm run harness:check:strict` | CI/릴리스용 엄격 검사 |
| `npm run policy:guard` | 개발 기준의 영향 분석과 위반 검사 |
| `npm run docs:check` | 문서 레지스트리, 링크, 코드 경로 검사 |
| `npm run absorb:report` | `harness:doctor` 호환 alias |
| `npm run guard` | `harness:check` 호환 alias |
| `npm run hooks:install` | 로컬 git hook 등록 |
| `npm run standards:list` | 원격 스택 기준 후보 조회 |
| `npm run stack:list` | `standards:list` alias |
| `npm run templates:list` | 원격 템플릿 후보 조회 |
| `npm run stack:status` | 활성 스택과 적용 상태 확인 |
| `npm run stack:apply` | 선택한 스택 기준을 로컬룰로 적용하고, 포함된 scaffold가 있으면 함께 적용 |
| `npm run stack:reset` | 적용된 스택 기준 관리 섹션과 scaffold 산출물 제거 |

## 스택 기준과 템플릿

하네스시드 본체는 특정 프레임워크를 전제로 하지 않습니다. 프로젝트에서는 회사 공통 기준을 직접 고르는 대신, 보통 회사 공통 기준을 기반으로 한 스택 기준을 선택합니다.

`none`은 스택 기준을 아직 고르지 않았거나, 예외적으로 공통 기준만 운영하는 내부 상태입니다. 일반 프로젝트 적용 흐름에서는 `harness:doctor` 리포트의 충돌 후보를 확인하고 스택 기준 선택 여부를 기록합니다.

본체에는 특정 스택 기준이나 템플릿을 넣지 않습니다. 스택 기준은 `ai-standard/harnesses` 쪽에서, 실제 scaffold 템플릿은 `ai-standard/stacks` 쪽에서 관리합니다.

스택 기준 후보는 다음 명령으로 조회합니다.

```bash
npm run standards:list
GITLAB_TOKEN=<private-token> npm run standards:list
```

현재 예정된 스택 기준 후보 예시는 다음 저장소입니다.

```bash
npm run stack:apply -- --preset-git https://git.smartscore.kr/ai-standard/harnesses/vue3-vite-pinia-router.git --ref v0.1.2
```

`stack:apply`는 선택한 스택의 instruction을 `.harness/project/stack-preset-rules.md`에 로컬룰로 기록합니다. 스택 기준 패키지가 `source.type=none`이면 파일 복사 없이 기준 문서만 정착합니다.

즉, 스택 기준은 공통 하네스가 모든 프로젝트에 강제하는 규칙이 아니라, 이 프로젝트가 선택한 기준으로 정착됩니다.

외부 스택 기준은 별도 폴더나 저장소로 관리합니다. 일회성 적용은 `npm run stack:apply -- --preset-path ../my-stack-standard` 또는 `npm run stack:apply -- --preset-git <repo-url> --ref <tag-or-branch>`를 사용합니다. 프로젝트에 고정하려면 `.harness/policy/profile.json`의 `stackManifest`에 외부 `manifest.json` 경로를 기록합니다.

scaffold 템플릿은 업무 파일을 생성하거나 복사할 수 있는 별도 자산입니다. 스택 기준만 적용하려는 경우에는 필요하지 않습니다. 새 프로젝트의 기본 파일 묶음이 필요할 때만 `ai-standard/stacks` 하위 저장소를 조회합니다.

```bash
npm run templates:list
GITLAB_TOKEN=<private-token> npm run templates:list
```

현재 등록된 템플릿 후보 예시는 다음 저장소입니다. 실제 적용 방법은 해당 템플릿 저장소의 README와 manifest 계약을 먼저 확인합니다.

```bash
npm run stack:apply -- --preset-git https://git.smartscore.kr/ai-standard/stacks/cloud-front-admin-template.git --ref <tag-or-branch>
```

권장 그룹 구조는 다음과 같습니다.

```text
ai-standard
├── harnesses
│   ├── harness-seed
│   └── vue3-vite-pinia-router
├── stacks
│   └── cloud-front-admin-template
├── agents
│   └── ai-standard-cli
├── policies
└── docs
```

역할은 `harnesses`가 AI 작업 규칙과 설치기 저장소, `stacks`가 프로젝트 scaffold 템플릿, `agents`가 자동화 CLI/라우터, `policies`가 회사 공통 기준 문서, `docs`가 표준 문서 진입점입니다.

## 여기서 말하는 policy

문서와 명령에 남아 있는 `policy`는 회사 규정이라는 뜻이 아니라, **프로젝트가 반복적으로 지키기로 한 개발 기준**을 뜻합니다.

예를 들면 “문서를 추가하면 레지스트리에 등록한다”, “기준 문서를 바꾸면 관련 스크립트도 함께 본다”, “특정 계층은 다른 계층을 직접 참조하지 않는다” 같은 기준입니다. `.harness/policy/`는 이런 기준이 코드, 문서, CI와 어긋나지 않는지 추적하는 내부 하네스 영역입니다.

## init 업데이트 옵션

`init`은 기존 하네스 파일이 있으면 먼저 `.harness-backup/<timestamp>/`에 백업합니다. `.harness/install-manifest.json`으로 하네스시드가 만든 파일인지 판단하고, 관리 파일은 갱신하며, 프로젝트 소유 파일과 출처를 알 수 없는 기존 하네스 파일은 보존합니다.

```bash
npx -y git+<seed-repo-url>#vX.Y.Z init --dry-run
npx -y git+<seed-repo-url>#vX.Y.Z init --force
npx -y git+<seed-repo-url>#vX.Y.Z init --no-doctor --no-check
npx -y git+<seed-repo-url>#vX.Y.Z init --from-git <seed-repo-url> --ref vX.Y.Z
```

`--no-doctor`는 설치 직후 프로젝트 진단 리포트 자동 생성을 끕니다. `--no-check`는 설치 직후 하네스 기본 검사 자동 실행을 끕니다.

보존 대상 예시는 `.harness/project/project-charter.md`, `.harness/project/local-methodology.md`, `.harness/project/stack-preset-rules.md`, `.harness/project/domain-rules.md`, `.harness/project/architecture-rules.md`, `.harness/project/workflow-rules.md`, `.harness/session/active-context.md`, `.harness/policy/profile.json`, `.harness/policy/waivers.json`, `.claude/settings.local.json`입니다.

## Claude Code 어댑터

`.claude/`는 Claude Code 실행 표면을 하네스에 연결하는 선택형 어댑터입니다. 기준 문서와 검증 기준은 계속 `.harness/`에 있고, Claude Code에서는 다음 기능을 추가로 쓸 수 있습니다.

- `/harness-absorb`: 현재 프로젝트를 분석해 `.harness/project`, `.harness/policy`, `.harness/session` 문서에 반영합니다.
- `npm run harness:doctor`: `/harness-absorb` 전에 `.harness/session/absorb-report.md`를 생성해 자동 감지 결과를 남깁니다.
- 기존 개인/전용 룰 파일이 보존된 경우 `harness:doctor`가 브리지 섹션 추가 후보와 예시 문구를 제안합니다.
- `code-reviewer`, `debug-detective`, `test-writer`, `security-auditor`: 하네스 기준을 먼저 읽는 Claude Code 서브에이전트입니다.
- status line과 context hook: 브랜치, dirty 상태, active stack을 짧게 표시합니다.

## Node 버전

- 권장 버전은 `.nvmrc`의 Node `22.14.0`입니다.
- 지원 범위는 `>=20.19.0 || >=22.13.0`입니다.
- 낮은 Node에서 실행하면 하네스 명령이 먼저 업그레이드 안내를 출력합니다.
- 스택 기준이나 템플릿이 더 높은 Node 버전을 요구하면 해당 자산의 `manifest.json` 또는 instruction 문서에 별도로 기록합니다.

## 빈 프로젝트를 새로 시작할 때

빈 폴더를 만든 뒤 공통 하네스를 설치하고, 필요한 스택 기준과 scaffold 템플릿을 선택합니다.

```bash
mkdir my-app
cd my-app
npx -y git+https://git.smartscore.kr/ai-standard/harnesses/harness-seed.git#v0.2.10 init
npm run stack:status
npm run standards:list
npm run stack:apply -- --preset-git https://git.smartscore.kr/ai-standard/harnesses/vue3-vite-pinia-router.git --ref v0.1.2
npm run templates:list      # scaffold 템플릿이 필요할 때만 조회
npm run hooks:install
npm run harness:check
```

## 본체 저장소를 운영할 때

이 저장소를 하네스 본체로 계속 관리하는 경우:

- `.harness-seed-mode`를 유지합니다.
- 하네스 본체 변경 후 `npm run harness:check:strict`를 실행합니다.
- seed-mode에서는 `harness:check`가 init smoke test를 함께 실행합니다.
- 배포는 태그 기준으로 합니다. 예: `v0.2.10`.
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
- 개발 기준 동기화 모델: `.harness/policy/sync-protocol.md`
- 스택 기준 구조: `.harness/stacks/README.md`
