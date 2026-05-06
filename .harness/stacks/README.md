# Stacks

이 저장소의 본체는 **일반 하네스(generic harness)** 입니다. 스택 기준과 scaffold 템플릿은 본체 밖에서 받아오는 선택형 자산입니다.

## 정의
- **일반 하네스**: 세션 복구, 기준 동기화, 문서 인덱싱, 스타일 출처 감지, doc-link 검사 등 어떤 프레임워크에서도 동일하게 쓰는 인프라.
- **스택 기준**: 특정 프레임워크, 런타임, 디자인 패턴에 맞춘 instruction 문서와 기준 매핑.
- **스택 템플릿**: 실제 프로젝트 scaffold 파일 묶음. 기준과 분리될 수 있습니다.

## 기본 상태
| id | 설명 | status |
| --- | --- | --- |
| `none` | 스택 기준을 아직 고르지 않았거나 예외적으로 공통 기준만 운영 | internal |

하네스시드 본체는 특정 스택 기준이나 scaffold 템플릿을 포함하지 않습니다. 프로젝트 적용 시에는 스택 기준을 선택하고, 필요한 경우 별도 템플릿 저장소에서 scaffold를 적용합니다.

## 스택 기준 후보 조회
사내 GitLab에서는 `ai-standard/harnesses` 하위 저장소를 스택 기준 후보로 조회합니다.

```bash
npm run standards:list
```

비공개 그룹이면 토큰을 함께 전달합니다.

```bash
GITLAB_TOKEN=<private-token> npm run standards:list
```

현재 예정된 스택 기준 후보 예시:

```bash
npm run stack:apply -- --preset-git https://git.smartscore.kr/ai-standard/harnesses/vue3-vite-pinia-router.git --ref master
```

기본 조회 대상:
- GitLab URL: `https://git.smartscore.kr`
- 그룹: `ai-standard/harnesses`

필요하면 환경변수로 바꿉니다.

```bash
HARNESS_GITLAB_URL=https://git.example.com \
HARNESS_STACK_STANDARD_GROUP=ai-standard/harnesses \
npm run standards:list
```

## scaffold 템플릿 후보 조회
사내 GitLab에서는 `ai-standard/stacks` 하위 저장소를 템플릿 후보로 조회합니다.

```bash
npm run templates:list
```

비공개 그룹이면 토큰을 함께 전달합니다.

```bash
GITLAB_TOKEN=<private-token> npm run templates:list
```

현재 등록된 템플릿 후보 예시:

```bash
npm run stack:apply -- --preset-git https://git.smartscore.kr/ai-standard/stacks/cloud-front-admin-template.git --ref main
```

기본 조회 대상:
- GitLab URL: `https://git.smartscore.kr`
- 그룹: `ai-standard/stacks`

필요하면 환경변수로 바꿉니다.

```bash
HARNESS_GITLAB_URL=https://git.example.com \
HARNESS_TEMPLATE_GROUP=ai-standard/stacks \
npm run templates:list
```

권장 그룹 구조:

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

- `harnesses`: AI 작업 규칙과 설치기 저장소 모음
- `stacks`: 프로젝트 scaffold 템플릿 모음
- `agents`: 자동화 CLI/라우터 모음
- `policies`: 회사 공통 기준 문서
- `docs`: 표준 문서 진입점

## 외부 스택 자산 계약
외부 스택 자산은 아래 구조를 가진 독립 폴더 또는 별도 저장소입니다.

```text
my-stack-preset/
  manifest.json
  policies.json
  instructions/
    architecture.md
  scaffold/                 # scaffold가 있는 경우에만 필요
    package.merge.json
    ...
```

`manifest.json`의 상대 경로는 manifest가 있는 폴더 기준으로 해석합니다.

```json
{
  "id": "my-stack",
  "title": "My Stack",
  "instructions": ["instructions/architecture.md"],
  "policiesFile": "policies.json",
  "checksKey": null,
  "source": {
    "type": "local",
    "path": "scaffold",
    "packageMerge": "scaffold/package.merge.json"
  }
}
```

스택 기준만 있고 scaffold가 없으면 `source.type`을 `none`으로 둡니다.

```json
{
  "id": "my-stack",
  "title": "My Stack",
  "instructions": ["instructions/architecture.md"],
  "policiesFile": "policies.json",
  "checksKey": null,
  "source": {
    "type": "none"
  }
}
```

## 적용 방법
로컬 폴더에서 적용:

```bash
npm run stack:apply -- --preset-path ../my-stack-preset
```

원격 저장소에서 바로 적용:

```bash
npm run stack:apply -- --preset-git <repo-url> --ref <tag-or-branch>
```

프로젝트에 고정:

```json
{
  "activeStack": "my-stack",
  "stackManifest": "../my-stack-preset/manifest.json"
}
```

`stack:apply`는 선택한 스택 자산의 instruction을 `.harness/project/stack-preset-rules.md`에 로컬룰로 기록합니다. `source.type=none`이면 파일 복사 없이 기준 문서만 정착합니다. 따라서 스택의 스타일/아키텍처 기준은 공통 하네스의 전역 강제가 아니라, 해당 프로젝트가 선택한 로컬 기준으로 해석합니다.

적용 후에는 `npm run harness:check`로 일반 하네스 문서, 기준, 링크, 적용된 스택 상태를 함께 확인합니다.

## 격리 원칙
1. 일반 하네스 문서와 스크립트는 특정 스택 폴더를 직접 참조하지 않습니다.
2. 스택 기준과 템플릿은 자체 완결적인 폴더 또는 저장소여야 합니다.
3. 스택 기준은 `policies.json`을 통해서만 일반 인프라에 노출합니다.
4. 스택 전용 자동 검사는 본체가 아니라 해당 스택 기준 또는 템플릿 저장소의 guard에 연결합니다.
5. 본체는 manifest, policies, instructions, scaffold를 읽고 적용하는 런타임 역할만 담당합니다.
