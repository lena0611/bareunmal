# Stacks

이 저장소의 본체는 **일반 하네스(generic harness)** 입니다. 스택 프리셋(stack preset)은 본체 밖에서 받아오는 선택형 템플릿입니다.

## 정의
- **일반 하네스**: 세션 복구, 정책 동기화, 문서 인덱싱, 스타일 출처 감지, doc-link 검사 등 어떤 프레임워크에서도 동일하게 쓰는 인프라.
- **스택 프리셋**: 특정 프레임워크, 런타임, 디자인 패턴에 맞춘 instruction 문서, 정책 매핑, scaffold 파일 묶음.

## 기본 상태
| id | 설명 | status |
| --- | --- | --- |
| `none` | 어떤 프리셋도 적용하지 않고 일반 하네스만 사용 | default |

하네스시드 본체는 특정 스택 프리셋을 포함하지 않습니다. 프리셋이 필요하면 별도 폴더나 원격 저장소에서 받아와 적용합니다.

## 템플릿 후보 조회
사내 GitLab에 `ai-standard/template` 그룹을 만들면 하위 프로젝트를 템플릿 후보로 조회할 수 있습니다.

```bash
npm run templates:list
```

비공개 그룹이면 토큰을 함께 전달합니다.

```bash
GITLAB_TOKEN=<private-token> npm run templates:list
```

기본 조회 대상:
- GitLab URL: `https://git.smartscore.kr`
- 그룹: `ai-standard/template`

필요하면 환경변수로 바꿉니다.

```bash
HARNESS_GITLAB_URL=https://git.example.com \
HARNESS_TEMPLATE_GROUP=ai-standard/template \
npm run templates:list
```

## 외부 프리셋 계약
외부 프리셋은 아래 구조를 가진 독립 폴더 또는 별도 저장소입니다.

```text
my-stack-preset/
  manifest.json
  policies.json
  instructions/
    architecture.md
  scaffold/
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

`stack:apply`는 선택한 프리셋의 instruction을 `.harness/project/stack-preset-rules.md`에 로컬룰로 기록합니다. 따라서 프리셋의 스타일/아키텍처 기준은 공통 하네스의 전역 강제가 아니라, 해당 프로젝트가 선택한 로컬 기준으로 해석합니다.

## 격리 원칙
1. 일반 하네스 문서와 스크립트는 특정 스택 폴더를 직접 참조하지 않습니다.
2. 프리셋은 자체 완결적인 폴더 또는 저장소여야 합니다.
3. 프리셋의 정책은 `policies.json`을 통해서만 일반 인프라에 노출합니다.
4. 프리셋 전용 자동 검사는 본체가 아니라 해당 템플릿 저장소의 guard에 연결합니다.
5. 본체는 프리셋의 manifest, policies, instructions, scaffold를 읽고 적용하는 런타임 역할만 담당합니다.
