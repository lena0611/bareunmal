# bareunmal

Vue 3 + Pinia + Vite + TypeScript 기반의 기본 스캐폴드입니다.

## 자동 배포
- `main` 브랜치에 푸시하면 GitHub Actions가 자동으로 빌드 후 GitHub Pages에 배포합니다.
- 배포 주소: `https://lena0611.github.io/bareunmal/`

## 시작하기
```bash
npm install
npm run dev
```

## 빌드
```bash
npm run build
```

## 구조
```text
src/
  app/
  pages/
  widgets/
  features/
  entities/
  shared/
  core/
    domain/
    application/
  adapters/
    vue/
      stores/
      composables/
```
