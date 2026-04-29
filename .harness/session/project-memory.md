# 프로젝트 메모리

세션이 바뀌어도 유지되는 안정적인 사실을 기록합니다.

## 프로젝트 성격
- 이 저장소는 **일반화된 프로젝트 시작 하네스**입니다.
- 일반 하네스(세션·정책·문서·스타일 동기화 인프라)만 본체에 포함합니다.
- 스택 프리셋(프레임워크+디자인패턴 꾸러미)은 외부 폴더나 원격 저장소에서 받아와 적용합니다.

## 사용 가능한 스택 프리셋
- `none` — 일반 하네스만 사용
- 외부 템플릿 — `npm run templates:list`, `--preset-path`, `--preset-git`, `stackManifest`로 연결

## 활성 스택 결정
- `.harness/policy/profile.json`의 `activeStack`이 단일 진실 출처입니다.
- 외부 프리셋의 `manifest.json`이 `instructions`, `policiesFile`, `checksKey`, `source`(scaffold 가져오는 방법)를 모두 정의합니다.

## 일반 하네스 구성
- `.harness/session/`: 세션 컨텍스트 복구
- `.harness/project/`: 프로젝트 목적/범위 + 부트스트랩 인터뷰 + 이식 가이드
- `.harness/policy/`: 정책↔코드 양방향 동기화, SYNC GAP 검출, waiver
- `.harness/documentation/`: 문서 인덱싱/분리 규칙, doc-link 무결성
- `.harness/style/`: 코딩 스타일 검증
- `.harness/stacks/`: 외부 프리셋 계약과 적용 방법 문서

## 스택 적용 메커니즘
- `scripts/apply-stack.mjs`가 source adapter 패턴으로 동작:
  - `--preset-path`: 로컬 프리셋 폴더의 `manifest.json` 사용
  - `--preset-git`: 원격 저장소를 임시 clone해 `manifest.json` 사용
  - `stackManifest`: 프로젝트에 고정된 외부 manifest 경로 사용
- 적용 시 root `package.json`에 `package.merge.json`을 머지하고 `.harness/.stack-applied.json` 마커 기록.
- `stack:reset`은 마커를 기준으로 복사된 파일 제거 + package.json 적용 전 상태로 복원.
- harness 스크립트는 충돌 시 항상 우선 (스택이 덮어쓰지 못함).

## 핵심 검증 명령
- `npm run guard`: 통합. policy + docs + (스택 적용 시) lint+test+build
- `npm run policy:guard` / `policy:guard:strict`
- `npm run docs:check` / `docs:check:strict`
- `npm run stack:status` / `stack:apply` / `stack:reset`
- `main` 푸시 시 GitHub Actions(`policy-guard.yml`)가 `--strict`로 실행

## 운영 장치 원칙
- 하네스는 방향과 읽기 순서를 제공.
- 트리거는 특정 변경/상황에서 검토를 다시 떠올리게 함.
- 훅은 CI나 실행 단계에서 실제 검사를 강제.
- 강제 강도: `inform → trigger → hook → block`.
- 예외 허용: `none / defer / waiver`.
- 강도/예외가 애매하면 사용자에게 먼저 확인.

## 격리 원칙 (반드시 지킬 것)
1. 일반 하네스 문서·스크립트는 특정 스택을 직접 참조하지 않음.
2. 프리셋은 자체-완결. 폴더 단위나 저장소 단위로 옮길 수 있어야 함.
3. 스택의 정책은 반드시 `policies.json`을 통해서만 일반 인프라에 노출.
4. 프리셋 전용 자동 검사는 해당 템플릿 저장소의 guard에 둠.
