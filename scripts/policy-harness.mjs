import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const harnessRootRel = fs.existsSync(path.join(repoRoot, '.harness')) ? '.harness' : '.github'
const harnessRoot = path.join(repoRoot, harnessRootRel)
const registryPath = path.join(harnessRoot, harnessRootRel === '.harness' ? 'policy' : 'policy-harness', 'policy-registry.json')
const profilePath = path.join(harnessRoot, harnessRootRel === '.harness' ? 'policy' : 'policy-harness', 'profile.json')
const stacksRoot = path.join(harnessRoot, 'stacks')

const args = process.argv.slice(2)
const mode = args[0] ?? 'guard'
const strictMode = args.includes('--strict')

function readProfile() {
  if (!fs.existsSync(profilePath)) {
    return { activeStack: 'none' }
  }

  try {
    return JSON.parse(fs.readFileSync(profilePath, 'utf8'))
  } catch {
    return { activeStack: 'none' }
  }
}

function resolvePresetManifestPath(stackId, profile) {
  if (profile.stackManifest) {
    return path.resolve(repoRoot, profile.stackManifest)
  }

  return path.join(stacksRoot, stackId, 'manifest.json')
}

function resolveManifestRelative(manifestRoot, relPath) {
  if (!relPath) {
    return null
  }

  if (path.isAbsolute(relPath)) {
    return relPath
  }

  if (relPath.startsWith('.harness/') || relPath.startsWith('.github/') || relPath.startsWith('scripts/')) {
    return path.join(repoRoot, relPath)
  }

  return path.join(manifestRoot, relPath)
}

function readActiveStack() {
  const profile = readProfile()
  const stackId = profile.activeStack ?? 'none'

  if (stackId === 'none') {
    return { id: 'none', manifest: null, policies: [], checksKey: null }
  }

  const manifestPath = resolvePresetManifestPath(stackId, profile)

  if (!fs.existsSync(manifestPath)) {
    console.warn(`activeStack='${stackId}' 의 manifest를 찾을 수 없습니다: ${manifestPath}`)
    return { id: stackId, manifest: null, policies: [], checksKey: null }
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const manifestRoot = path.dirname(manifestPath)
  const policiesFile = manifest.policiesFile
    ? resolveManifestRelative(manifestRoot, manifest.policiesFile)
    : path.join(manifestRoot, 'policies.json')

  let policies = []

  if (fs.existsSync(policiesFile)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(policiesFile, 'utf8'))
      policies = parsed.policies ?? []
    } catch {
      console.warn(`스택 정책 파일 파싱 실패: ${policiesFile}`)
    }
  }

  return {
    id: stackId,
    manifest,
    policies,
    checksKey: manifest.checksKey ?? null,
  }
}

function getArgValue(flag) {
  const index = args.indexOf(flag)

  if (index === -1 || index === args.length - 1) {
    return undefined
  }

  return args[index + 1]
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/')
}

function escapeRegExp(value) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')
}

function globToRegExp(glob) {
  const escaped = glob
    .split('**')
    .map((segment) => segment.split('*').map(escapeRegExp).join('[^/]*'))
    .join('::DOUBLE_STAR::')

  return new RegExp(
    `^${escaped.replaceAll('::DOUBLE_STAR::', '.*')}$`,
  )
}

function matchesGlob(filePath, glob) {
  return globToRegExp(glob).test(filePath)
}

function matchesAnyGlob(filePath, globs) {
  return globs.some((glob) => matchesGlob(filePath, glob))
}

function walkDirectory(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    return []
  }

  const entries = fs.readdirSync(directoryPath, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name)

    if (entry.isDirectory()) {
      files.push(...walkDirectory(entryPath))
      continue
    }

    files.push(toPosixPath(path.relative(repoRoot, entryPath)))
  }

  return files
}

function readText(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
}

function readRegistry() {
  const base = JSON.parse(fs.readFileSync(registryPath, 'utf8'))
  const stack = readActiveStack()

  return {
    ...base,
    policies: [...(base.policies ?? []), ...stack.policies],
  }
}

function runGit(argsToRun) {
  return execFileSync('git', argsToRun, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()
}

function getAllTrackedFiles() {
  return walkDirectory(path.join(repoRoot, 'src')).concat(
    walkDirectory(path.join(repoRoot, '.github')),
    walkDirectory(path.join(repoRoot, 'scripts')),
    ['package.json', 'README.md'].filter((filePath) => fs.existsSync(path.join(repoRoot, filePath))),
  )
}

function getChangedFiles() {
  const base = getArgValue('--base')
  const head = getArgValue('--head')

  if (base && head && !/^0+$/.test(base)) {
    try {
      const output = runGit(['diff', '--name-only', base, head])
      return output ? output.split('\n').filter(Boolean) : []
    } catch {
      return getChangedFilesFromHead()
    }
  }

  return getChangedFilesFromHead()
}

function unique(values) {
  return [...new Set(values)]
}

function getWorkingTreeChangedFiles() {
  const changed = []

  try {
    const trackedChanges = runGit(['diff', '--name-only', 'HEAD'])
    changed.push(...(trackedChanges ? trackedChanges.split('\n').filter(Boolean) : []))
  } catch {
    // noop
  }

  try {
    const untrackedChanges = runGit(['ls-files', '--others', '--exclude-standard'])
    changed.push(...(untrackedChanges ? untrackedChanges.split('\n').filter(Boolean) : []))
  } catch {
    // noop
  }

  return unique(changed).filter((filePath) => !isIgnoredPolicyChange(filePath))
}

function getChangedFilesFromHead() {
  const workingTreeChangedFiles = getWorkingTreeChangedFiles()

  if (workingTreeChangedFiles.length > 0) {
    return workingTreeChangedFiles
  }

  try {
    const output = runGit(['diff', '--name-only', 'HEAD~1', 'HEAD'])
    return output ? output.split('\n').filter(Boolean) : []
  } catch {
    try {
      const output = runGit(['status', '--short'])
      return output
        .split('\n')
        .filter(Boolean)
        .map((line) => line.slice(3))
        .filter((filePath) => !isIgnoredPolicyChange(filePath))
    } catch {
      return []
    }
  }
}

function isIgnoredPolicyChange(filePath) {
  return (
    filePath.startsWith('node_modules/') ||
    filePath.startsWith('dist/') ||
    filePath.startsWith('.git/') ||
    filePath.startsWith('.idea/') ||
    filePath === '.package-json.hash' ||
    filePath === '.node-version.cache'
  )
}

function resolveImport(importerPath, specifier) {
  if (specifier.startsWith('@/')) {
    return toPosixPath(path.posix.normalize(`src/${specifier.slice(2)}`))
  }

  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    const importerDir = path.posix.dirname(importerPath)
    return toPosixPath(path.posix.normalize(path.posix.join(importerDir, specifier)))
  }

  return specifier
}

function getImports(relativePath) {
  const content = readText(relativePath)
  const imports = []
  const importPattern =
    /\bimport\s+(?:type\s+)?(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]|\bexport\s+[^'";]+?\s+from\s+['"]([^'"]+)['"]/g

  for (const match of content.matchAll(importPattern)) {
    const specifier = match[1] ?? match[2]

    if (specifier) {
      imports.push({
        specifier,
        resolved: resolveImport(relativePath, specifier),
      })
    }
  }

  return imports
}

function collectViolations() {
  const stack = readActiveStack()
  const violations = []
  const checksKey = stack.checksKey

  if (!checksKey) {
    return violations
  }

  console.warn(`checksKey='${checksKey}' 는 본체에서 실행하지 않습니다. 프리셋 전용 검사는 해당 스택 기준 또는 템플릿 저장소의 guard에 연결하세요.`)

  return violations
}

function formatFileList(files) {
  if (files.length === 0) {
    return '  - 없음'
  }

  return files.map((filePath) => `  - ${filePath}`).join('\n')
}

function isHarnessBootstrapChange(filePath) {
  return (
    filePath.startsWith('.github/') ||
    filePath.startsWith('.harness/') ||
    filePath.startsWith('.githooks/') ||
    filePath.startsWith('scripts/') ||
    filePath === '.nvmrc' ||
    filePath === '.gitignore' ||
    filePath === 'AGENTS.md' ||
    filePath === 'CLAUDE.md' ||
    filePath === '.harness/.stack-applied.json' ||
    filePath === '.github/.stack-applied.json' ||
    filePath === 'package.json' ||
    filePath === 'package-lock.json'
  )
}

function runImpact() {
  const registry = readRegistry()
  const trackedFiles = getAllTrackedFiles()
  const changedFiles = getChangedFiles()

  console.log('Policy impact analysis')
  console.log('')

  if (changedFiles.length === 0) {
    console.log('변경 파일을 찾지 못했습니다. 정책 영향도는 현재 작업 트리 기준으로 수동 확인이 필요합니다.')
    return
  }

  if (!strictMode && changedFiles.length > 20 && changedFiles.every(isHarnessBootstrapChange)) {
    console.log(`Harness bootstrap changes detected (${changedFiles.length} files).`)
    console.log('상세 정책 영향 목록은 생략합니다. CI/릴리스 검증에서는 --strict로 전체 영향을 확인하세요.')
    return
  }

  console.log('Changed files:')
  console.log(formatFileList(changedFiles))
  console.log('')

  const policyTriggered = []
  const codeTriggered = []
  const syncGaps = []

  for (const policy of registry.policies) {
    const documentChanged = changedFiles.some((filePath) => matchesAnyGlob(filePath, policy.documents))
    const sourceChanged = changedFiles.some((filePath) => matchesAnyGlob(filePath, policy.ownedAreas))
    const hasOwnedFiles = trackedFiles.some((filePath) => matchesAnyGlob(filePath, policy.ownedAreas))

    if (documentChanged) {
      const impactedFiles = trackedFiles.filter((filePath) => matchesAnyGlob(filePath, policy.ownedAreas))
      policyTriggered.push({
        title: policy.title,
        files: impactedFiles,
      })
    }

    if (sourceChanged) {
      codeTriggered.push({
        title: policy.title,
        documents: policy.documents,
      })
    }

    if (documentChanged !== sourceChanged && (sourceChanged || hasOwnedFiles)) {
      syncGaps.push({
        id: policy.id,
        title: policy.title,
        side: documentChanged ? 'document-only' : 'source-only',
        documents: policy.documents,
        ownedAreas: policy.ownedAreas,
      })
    }
  }

  if (policyTriggered.length > 0) {
    console.log('Policy document changes require source review:')

    for (const item of policyTriggered) {
      console.log(`- ${item.title}`)
      console.log(formatFileList(item.files))
    }

    console.log('')
  }

  if (codeTriggered.length > 0) {
    console.log('Source changes require policy review:')

    for (const item of codeTriggered) {
      console.log(`- ${item.title}`)
      console.log(formatFileList(item.documents))
    }

    console.log('')
  }

  if (policyTriggered.length === 0 && codeTriggered.length === 0) {
    console.log('등록된 정책-코드 매핑에 걸리는 변경은 없습니다.')
  }

  if (syncGaps.length > 0) {
    console.log('')
    console.log('SYNC GAP detected (한쪽만 변경되어 정책-코드 동기화가 무너질 수 있음):')

    for (const gap of syncGaps) {
      const sideLabel = gap.side === 'document-only' ? '문서만 변경됨' : '소스만 변경됨'
      console.log(`- [${gap.id}] ${gap.title} — ${sideLabel}`)
      console.log('  documents:')
      console.log(formatFileList(gap.documents))
      console.log('  ownedAreas:')
      console.log(formatFileList(gap.ownedAreas))
    }

    console.log('')
    console.log('해결: 반대편을 함께 갱신하거나, 의도적이라면 waiver/decision-log에 기록하세요.')

    if (strictMode) {
      process.exitCode = 1
    }
  }
}

function runCheck() {
  const violations = collectViolations()

  if (violations.length === 0) {
    console.log('Policy check passed')
    return
  }

  console.error('Policy check failed')
  console.error('')

  for (const violation of violations) {
    console.error(`[${violation.rule}] ${violation.file}: ${violation.message}`)
  }

  process.exitCode = 1
}

if (mode === 'impact') {
  runImpact()
} else if (mode === 'check') {
  runCheck()
} else if (mode === 'guard') {
  runImpact()
  console.log('')
  runCheck()
} else {
  console.error(`Unknown mode: ${mode}`)
  process.exit(1)
}
