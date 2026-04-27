# bareunmal

**일반화된 프로젝트 시작 하네스**입니다. 프레임워크나 디자인 패턴은 "스택 프리셋"으로 분리되어 있고, 새 프로젝트를 시작할 때 원하는 스택을 선택해서 적용합니다.

## 구성

- **일반 하네스 (root + `.github/`)**: 세션 복구, 정책↔코드 동기화, 문서 인덱싱, 스타일 검증, doc-link/SYNC GAP 검사 등 프레임워크-독립 인프라.
- **스택 프리셋 (`.github/stacks/<id>/`)**: 특정 프레임워크 + 디자인 패턴 꾸러미 (instructions + policies + scaffold).

현재 사용 가능한 스택:
- `vue3-fsd` — Vue 3 + Pinia + Vite + TypeScript / FSD + Clean Architecture + Headless Core + Adapter
- `none` — 일반 하네스만 사용

## 새 프로젝트 시작

1. 이 저장소를 템플릿 삼아 새 저장소를 만듭니다.
2. `.github/project-harness/bootstrap.md` 인터뷰 절차에 따라 프로젝트 개요와 스택을 입력합니다.
3. `.github/policy-harness/profile.json`의 `activeStack`을 원하는 스택 id로 설정합니다.
4. 스캐폴드를 적용합니다:
   ```bash
   npm run stack:apply
   npm install
   npm run guard
   ```

## 주요 명령

```bash
npm run guard               # 통합 가드 (policy + docs + lint/test/build)
npm run policy:guard        # 정책 영향 분석 + 위반 검사
npm run docs:check          # 문서 레지스트리/링크/코드 경로 무결성
npm run stack:status        # 활성 스택 / 적용 상태 확인
npm run stack:apply         # 활성 스택 scaffold 적용
npm run stack:reset         # 적용된 scaffold 제거 + package.json 복원
npm run hooks:install       # 로컬 git hook 설치
```

## 세션 컨텍스트
- 새 세션에서 빠르게 컨텍스트를 복구하려면 `.github/session-harness/README.md`부터 읽습니다.
- 다음 세션에서 다시 확인할 항목은 `.github/session-harness/next-session-reminder.md`에 정리되어 있습니다.

## 자동 배포
- 활성 스택이 적용된 상태에서 `main` 브랜치에 푸시하면 GitHub Actions가 빌드 후 GitHub Pages로 배포합니다(`vue3-fsd` 스택 기준).
- 배포 주소: `https://lena0611.github.io/bareunmal/`

## 이식
- 다른 프로젝트로 옮기는 절차는 `.github/project-harness/portability-guide.md`를 참고합니다.
- 새 스택을 추가하는 절차는 `.github/stacks/README.md`를 참고합니다.
