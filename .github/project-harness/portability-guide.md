# Portability Guide

이 저장소를 다른 프로젝트(다른 프레임워크 또는 다른 도메인)로 옮기거나 새 저장소에서 같은 하네스 구조를 재사용할 때의 절차입니다.

## 분리 원칙
- 일반 인프라(세션/문서/정책 동기화/스타일 하네스, doc-link 검증, SYNC GAP 검출)는 모든 프로젝트에서 그대로 재사용합니다.
- 프레임워크-특화 검사(현재는 Vue/Pinia/FSD)는 프로파일로만 켜고 끕니다.

## 이식 절차
1. 이 저장소를 템플릿 삼아 새 저장소를 만듭니다.
2. `npm run stack:reset` (적용된 스택이 있으면) 으로 기존 scaffold를 제거합니다.
3. `.github/policy-harness/profile.json`의 `activeStack`을 원하는 값으로 변경합니다 (구조만 쓰고 싶으면 `"none"`).
4. `npm run stack:apply` 로 새 스택을 적용합니다.
5. `npm install` 후 `npm run guard`로 검증합니다.
6. 새 스택이 필요하면 `.github/stacks/<new-id>/`를 추가하고(manifest.json + policies.json + instructions/ + scaffold/ + package.merge.json), `.github/stacks/README.md` 표에 등록합니다.
7. `policy-registry.json`은 일반 정책만 유지합니다. 스택-특화 정책은 스택의 `policies.json`으로만 널습니다.
8. `policy-harness.mjs`의 framework-specific 블록은 새 `checksKey`를 원할 때만 분기 확장합니다.
9. `project-charter.md`, `scope-contract.md`를 새 도메인 정보로 채웁니다.

## 소스 어댑터 (`source.type`)
- `local`: 스택의 `scaffold/` 폴더에서 직접 복사. 현재 기본.
- `tiged`: 외부 GitHub 저장소에서 `npx tiged`로 가져오기. **미구현 스텅** — 스택 수가 늘거나 외부 공유가 필요해지면 활성화합니다.
- 마이그레이션 시점: 스택 수 ≥ 2 또는 스택을 다른 저장소에서 공유해야 하는 시점. 그전까지는 `local` 유지.
- 전환 방법: 스택 `manifest.json`의 `source` 섹션을 `{ "type": "tiged", "ref": "..." }`로 바꾸고 `scripts/apply-stack.mjs`의 `adapterTiged`를 구현하면 끝 (인터페이스 동일).


## 그대로 두는 것
- 세션 하네스 구조와 문서들
- 문서 인덱싱 규칙과 분리 기준
- 정책 동기화 프로토콜과 강제 강도 기준
- doc-link 검증, SYNC GAP 검출, waiver 체계
- CI 워크플로 골격(`policy-guard.yml`)

## 검증
- 이식 직후 `npm run docs:check`와 `npm run policy:guard:strict`를 실행해 일반 인프라가 깨지지 않았는지 확인합니다.
