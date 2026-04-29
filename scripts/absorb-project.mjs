#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const repoRoot = path.resolve(path.dirname(__filename), '..')
const args = process.argv.slice(2)
const writeReport = args.includes('--write')
const outputArgIndex = args.indexOf('--output')
const outputPath = outputArgIndex >= 0 && args[outputArgIndex + 1]
  ? args[outputArgIndex + 1]
  : '.harness/session/absorb-report.md'

const ignoredDirs = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.harness-backup',
  '.venv',
  'vendor',
  'target',
])

function exists(rel) {
  return fs.existsSync(path.join(repoRoot, rel))
}

function readJson(rel, fallback = null) {
  const abs = path.join(repoRoot, rel)
  if (!fs.existsSync(abs)) return fallback
  try {
    return JSON.parse(fs.readFileSync(abs, 'utf8'))
  } catch {
    return fallback
  }
}

function runGit(gitArgs) {
  try {
    return execFileSync('git', gitArgs, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return ''
  }
}

function walk(dir, depth = 0, maxDepth = 3) {
  if (depth > maxDepth || !fs.existsSync(dir)) return []

  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue

    const abs = path.join(dir, entry.name)
    const rel = path.relative(repoRoot, abs).split(path.sep).join('/')
    out.push({ rel, entry, abs, depth })

    if (entry.isDirectory()) {
      out.push(...walk(abs, depth + 1, maxDepth))
    }
  }

  return out
}

function listExisting(candidates) {
  return candidates.filter((rel) => exists(rel))
}

function listByPrefix(prefixes) {
  return walk(repoRoot)
    .filter(({ rel, entry }) => entry.isFile() && prefixes.some((prefix) => rel.startsWith(prefix)))
    .map(({ rel }) => rel)
    .slice(0, 30)
}

function detectSourceRoots() {
  return ['src', 'app', 'lib', 'packages', 'apps', 'pkg', 'internal']
    .filter((rel) => exists(rel) && fs.statSync(path.join(repoRoot, rel)).isDirectory())
}

function detectTestRoots() {
  return ['test', 'tests', '__tests__', 'spec', 'cypress', 'playwright']
    .filter((rel) => exists(rel) && fs.statSync(path.join(repoRoot, rel)).isDirectory())
}

function detectManifestFiles() {
  return listExisting([
    'package.json',
    'pnpm-workspace.yaml',
    'pyproject.toml',
    'requirements.txt',
    'Cargo.toml',
    'go.mod',
    'pom.xml',
    'build.gradle',
    'composer.json',
    'Gemfile',
  ])
}

function detectBuildFiles() {
  return listExisting([
    'Makefile',
    'Justfile',
    'Taskfile.yml',
    'Dockerfile',
    'docker-compose.yml',
    'turbo.json',
    'nx.json',
    'vite.config.ts',
    'vitest.config.ts',
    'tsconfig.json',
  ])
}

function detectDocs() {
  const rootDocs = walk(repoRoot, 0, 1)
    .filter(({ rel, entry }) => entry.isFile() && /^README|^CONTRIBUTING|^ARCHITECTURE/i.test(path.basename(rel)))
    .map(({ rel }) => rel)

  return [...rootDocs, ...listByPrefix(['docs/', 'ADR/', 'adr/'])].slice(0, 30)
}

function detectCi() {
  return [
    ...listByPrefix(['.github/workflows/']),
    ...listExisting(['.gitlab-ci.yml', '.circleci/config.yml', 'azure-pipelines.yml', 'Jenkinsfile']),
  ]
}

function detectQualityFiles() {
  return listExisting([
    '.editorconfig',
    '.eslintrc',
    '.eslintrc.js',
    'eslint.config.js',
    'eslint.config.mjs',
    '.prettierrc',
    'prettier.config.js',
    'biome.json',
    'ruff.toml',
    'pytest.ini',
    'jest.config.js',
    'vitest.config.ts',
    'playwright.config.ts',
  ])
}

function detectLocalMethodologyFiles() {
  return listExisting([
    '.harness/project/local-methodology.md',
    '.harness/project/domain-rules.md',
    '.harness/project/architecture-rules.md',
    '.harness/project/workflow-rules.md',
  ])
}

function detectBridgeCandidates() {
  return listExisting(['CLAUDE.md', 'AGENTS.md', '.github/copilot-instructions.md'])
    .filter((rel) => {
      const content = fs.readFileSync(path.join(repoRoot, rel), 'utf8')
      return !content.includes('.harness/project/local-methodology.md')
    })
}

function readPackageSummary() {
  const pkg = readJson('package.json')
  if (!pkg) return null

  return {
    name: pkg.name ?? '(unnamed)',
    type: pkg.type ?? '(unspecified)',
    scripts: Object.keys(pkg.scripts ?? {}),
    dependencies: Object.keys(pkg.dependencies ?? {}),
    devDependencies: Object.keys(pkg.devDependencies ?? {}),
  }
}

function formatList(values, fallback = '- 없음') {
  if (!values || values.length === 0) return fallback
  return values.map((value) => `- ${value}`).join('\n')
}

function buildReport() {
  const profile = readJson('.harness/policy/profile.json', { activeStack: 'none' })
  const pkg = readPackageSummary()
  const branch = runGit(['branch', '--show-current']) || '(unknown)'
  const dirty = runGit(['status', '--short'])
  const generatedAt = new Date().toISOString()
  const sourceRoots = detectSourceRoots()
  const testRoots = detectTestRoots()
  const manifests = detectManifestFiles()
  const buildFiles = detectBuildFiles()
  const ciFiles = detectCi()
  const qualityFiles = detectQualityFiles()
  const docs = detectDocs()
  const localMethodologyFiles = detectLocalMethodologyFiles()
  const bridgeCandidates = detectBridgeCandidates()

  const suggestedCommands = pkg
    ? pkg.scripts.filter((name) => /^(dev|build|test|lint|typecheck|format|guard|docs:check|policy:guard|stack:status)$/.test(name))
    : []

  const questions = []
  if (!exists('.harness/project/project-charter.md')) {
    questions.push('프로젝트 charter가 없습니다. `.harness/project/bootstrap.md` 인터뷰가 필요합니다.')
  }
  if (localMethodologyFiles.length === 0) {
    questions.push('로컬 개발방법론 문서가 없습니다. `.harness/project/local-methodology.md` 계층을 확인해야 합니다.')
  }
  if (sourceRoots.length === 0) {
    questions.push('소스 루트를 찾지 못했습니다. 실제 업무 코드 위치를 확인해야 합니다.')
  }
  if (testRoots.length === 0 && (!pkg || !pkg.scripts.some((name) => name.includes('test')))) {
    questions.push('테스트 루트나 test script를 찾지 못했습니다. 검증 전략 확인이 필요합니다.')
  }
  if (!profile.activeStack) {
    questions.push('activeStack 값이 비어 있습니다. `none` 또는 스택 프리셋을 선택해야 합니다.')
  }
  if (bridgeCandidates.length > 0) {
    questions.push('기존 엔트리포인트가 로컬 방법론을 읽지 않습니다. Bridge Section Candidates를 검토하세요.')
  }

  return `# Harness Absorb Report

- generatedAt: ${generatedAt}
- branch: ${branch}
- workingTree: ${dirty ? 'dirty' : 'clean'}
- activeStack: ${profile.activeStack ?? 'none'}

## Package
${pkg ? `- name: ${pkg.name}
- type: ${pkg.type}
- scripts: ${pkg.scripts.length}
- dependencies: ${pkg.dependencies.length}
- devDependencies: ${pkg.devDependencies.length}` : '- package.json 없음'}

## Inventory

### Manifest Files
${formatList(manifests)}

### Build And Runtime Files
${formatList(buildFiles)}

### CI Files
${formatList(ciFiles)}

### Quality Files
${formatList(qualityFiles)}

### Documentation
${formatList(docs)}

### Local Methodology Files
${formatList(localMethodologyFiles)}

### Source Roots
${formatList(sourceRoots)}

### Test Roots
${formatList(testRoots)}

## Suggested Verification Commands
${formatList(suggestedCommands.map((name) => `npm run ${name}`))}

## Bridge Section Candidates
${formatList(bridgeCandidates)}

기존 개인/전용 룰 파일을 보존하는 경우, 필요한 파일에 아래 섹션을 추가할지 검토합니다.

\`\`\`markdown
## Project Harness Bridge

이 프로젝트에서는 기존 개인/전용 룰과 함께 하네스시드 기준을 읽습니다.

1. \`.harness/project/local-methodology.md\`
2. \`.harness/project/domain-rules.md\`
3. \`.harness/project/architecture-rules.md\`
4. \`.harness/project/workflow-rules.md\`
5. \`.harness/policy/README.md\`
6. \`.harness/session/active-context.md\`
\`\`\`

## Harness Update Targets
- .harness/project/project-charter.md
- .harness/project/scope-contract.md
- .harness/project/local-methodology.md
- .harness/project/domain-rules.md
- .harness/project/architecture-rules.md
- .harness/project/workflow-rules.md
- .harness/policy/profile.json
- .harness/session/active-context.md
- .harness/session/decision-log.md
- .harness/session/developer-input-queue.md

## Open Questions
${formatList(questions, '- 현재 자동 감지 기준의 필수 질문 없음')}
`
}

const report = buildReport()

if (writeReport) {
  const absOutput = path.resolve(repoRoot, outputPath)
  fs.mkdirSync(path.dirname(absOutput), { recursive: true })
  fs.writeFileSync(absOutput, report)
  console.log(`Absorb report written: ${path.relative(repoRoot, absOutput).split(path.sep).join('/')}`)
} else {
  process.stdout.write(report)
}
