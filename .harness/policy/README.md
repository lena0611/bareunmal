# Policy Harness

여기서 policy는 회사 규정이 아니라, 프로젝트가 반복적으로 지키기로 한 **개발 기준**을 뜻합니다.

이 하네스는 개발 기준 문서와 실제 소스 코드를 항상 동기화하기 위한 영역입니다.

## 목적
- 개발 기준 문서가 바뀌면 어떤 코드 영역을 재검토해야 하는지 자동으로 드러냅니다.
- 소스가 바뀌면 어떤 기준을 다시 확인해야 하는지 역으로 드러냅니다.
- 자동으로 검증 가능한 위반은 CI에서 실패 처리합니다.
- 새 세션에서도 이 트리거를 놓치지 않도록 세션 하네스와 연결합니다.

## 읽기 순서
1. [AI Standard Guiding Policy](./ai-standard-guiding-policy.md)
2. [기준 담당 가이드](./policy-steward.md)
3. [동기화 프로토콜](./sync-protocol.md)
4. [강제 강도 기준](./enforcement-ladder.md)
5. [자동화 커버리지](./automation-coverage.md)
6. [Waiver 가이드](./waiver-guidelines.md)
7. `policy-registry.json`
8. `waivers.json`

## 실행 명령
```bash
npm run policy:impact
npm run policy:check
npm run policy:guard
npm run policy:guard:strict
npm run docs:check
```

## 구성 요소
- `policy-registry.json`: 개발 기준 문서와 코드 영역의 연결 정보
- `ai-standard-guiding-policy.md`: `ai-standard` 그룹 전체 작업의 최상위 판단 기준
- `profile.json`: 활성 프리셋 프로파일 (`none` 또는 외부 프리셋 manifest)
- `enforcement-ladder.md`: 강제 강도와 예외 허용 범위 기준
- `automation-coverage.md`: 자동 검증/수동 검토 범위
- `waivers.json`: 승인된 예외 기록
- `scripts/policy-harness.mjs`: 영향 분석 및 위반 검사 (`--strict`로 SYNC GAP을 실패로 취급)
- `scripts/doc-link-check.mjs`: 문서 레지스트리 일관성과 마크다운 링크/코드 경로 참조 검증
- `.github/workflows/policy-guard.yml`: 푸시/PR 시 자동 실행 (CI는 `--strict`)

## 운영 원칙
- 개발 기준 변경은 문서 수정으로 끝내지 않습니다. 영향을 받는 코드 영역을 반드시 다시 봅니다.
- 소스 변경은 기능 수정으로 끝내지 않습니다. 관련 기준 위반이 없는지 반드시 다시 봅니다.
- 새 세션은 작업 시작 전에 세션 하네스와 policy 하네스를 함께 읽습니다.
- 이 문서는 인덱스 역할을 유지하고, 세부 기준은 하위 문서로 계속 분리합니다.
