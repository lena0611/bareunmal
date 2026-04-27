import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const profilePath = path.join(repoRoot, '.github', 'policy-harness', 'profile.json')
const markerPath = path.join(repoRoot, '.github', '.stack-applied.json')

const args = process.argv.slice(2)
const isReset = args.includes('--reset')
const isStatus = args.includes('--status')

function toPosix(p) {
  return p.split(path.sep).join('/')
}

function readJson(absPath, fallback = null) {
  if (!fs.existsSync(absPath)) {
    return fallback
  }

  try {
    return JSON.parse(fs.readFileSync(absPath, 'utf8'))
  } catch {
    return fallback
  }
}

function writeJson(absPath, value) {
  fs.writeFileSync(absPath, `${JSON.stringify(value, null, 2)}\n`)
}

function readProfile() {
  return readJson(profilePath, { activeStack: 'none' })
}

function readManifest(stackId) {
  const manifestPath = path.join(repoRoot, '.github', 'stacks', stackId, 'manifest.json')
  const manifest = readJson(manifestPath)

  if (!manifest) {
    throw new Error(`Stack manifest를 찾을 수 없습니다: ${manifestPath}`)
  }

  return manifest
}

function readMarker() {
  return readJson(markerPath)
}

function writeMarker(value) {
  writeJson(markerPath, value)
}

function deleteMarker() {
  if (fs.existsSync(markerPath)) {
    fs.unlinkSync(markerPath)
  }
}

function listScaffoldFiles(scaffoldRoot) {
  const out = []

  function walk(absDir, relDir) {
    for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
      if (entry.name === 'package.merge.json' && relDir === '') {
        continue
      }

      const absChild = path.join(absDir, entry.name)
      const relChild = relDir ? `${relDir}/${entry.name}` : entry.name

      if (entry.isDirectory()) {
        walk(absChild, relChild)
        continue
      }

      out.push(relChild)
    }
  }

  walk(scaffoldRoot, '')
  return out
}

function copyFileEnsuringDir(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
}

function mergePackageJson(packageMergePath) {
  if (!packageMergePath || !fs.existsSync(packageMergePath)) {
    return null
  }

  const rootPkgPath = path.join(repoRoot, 'package.json')
  const rootPkg = readJson(rootPkgPath, {})
  const snapshot = JSON.parse(JSON.stringify(rootPkg))
  const mergeData = readJson(packageMergePath, {})

  for (const section of ['scripts', 'dependencies', 'devDependencies']) {
    if (!mergeData[section]) {
      continue
    }

    rootPkg[section] = rootPkg[section] ?? {}

    for (const [key, value] of Object.entries(mergeData[section])) {
      if (section === 'scripts' && key in rootPkg[section]) {
        // harness script wins on conflict
        continue
      }

      rootPkg[section][key] = value
    }
  }

  writeJson(rootPkgPath, rootPkg)
  return snapshot
}

function restorePackageJson(snapshot) {
  if (!snapshot) {
    return
  }

  writeJson(path.join(repoRoot, 'package.json'), snapshot)
}

// ---------- Source adapters ----------

function adapterLocal(manifest) {
  const scaffoldRel = manifest.source.path
  const scaffoldRoot = path.join(repoRoot, scaffoldRel)

  if (!fs.existsSync(scaffoldRoot)) {
    throw new Error(`local source 경로가 존재하지 않습니다: ${scaffoldRel}`)
  }

  const files = listScaffoldFiles(scaffoldRoot)
  const copied = []

  for (const rel of files) {
    const src = path.join(scaffoldRoot, rel)
    const dest = path.join(repoRoot, rel)
    copyFileEnsuringDir(src, dest)
    copied.push(toPosix(rel))
  }

  return copied
}

function adapterTiged() {
  throw new Error(
    'source.type=tiged 어댑터는 아직 구현되지 않았습니다. 향후 마이그레이션 시 npx tiged <ref> .를 호출하는 구현을 이 함수에 추가하세요. 인터페이스는 adapterLocal과 동일하게 copied 파일 목록을 반환해야 합니다.',
  )
}

const SOURCE_ADAPTERS = {
  local: adapterLocal,
  tiged: adapterTiged,
}

// ---------- Commands ----------

function commandStatus() {
  const profile = readProfile()
  const marker = readMarker()

  console.log('Stack status')
  console.log(`  activeStack: ${profile.activeStack ?? 'none'}`)

  if (!marker) {
    console.log('  applied: no')
    return
  }

  console.log('  applied: yes')
  console.log(`  appliedStack: ${marker.stackId}`)
  console.log(`  appliedAt: ${marker.appliedAt}`)
  console.log(`  source.type: ${marker.source?.type ?? 'unknown'}`)
  console.log(`  files: ${marker.copiedFiles?.length ?? 0}`)

  if (profile.activeStack !== marker.stackId) {
    console.log('')
    console.log(`  WARNING: activeStack(${profile.activeStack})과 적용된 스택(${marker.stackId})이 다릅니다.`)
  }
}

function commandApply() {
  const profile = readProfile()
  const stackId = profile.activeStack

  if (!stackId || stackId === 'none') {
    console.error('activeStack이 설정되지 않았습니다. .github/policy-harness/profile.json의 activeStack을 먼저 지정하세요.')
    process.exit(1)
  }

  const existing = readMarker()

  if (existing) {
    console.error(`이미 스택이 적용되어 있습니다 (stackId=${existing.stackId}). 먼저 npm run stack:reset 실행 후 다시 시도하세요.`)
    process.exit(1)
  }

  const manifest = readManifest(stackId)
  const sourceType = manifest.source?.type ?? 'local'
  const adapter = SOURCE_ADAPTERS[sourceType]

  if (!adapter) {
    console.error(`알 수 없는 source.type: ${sourceType}. 지원: ${Object.keys(SOURCE_ADAPTERS).join(', ')}`)
    process.exit(1)
  }

  console.log(`Applying stack '${stackId}' (source.type=${sourceType})...`)
  const copiedFiles = adapter(manifest)
  const packageBackup = mergePackageJson(
    manifest.source?.packageMerge ? path.join(repoRoot, manifest.source.packageMerge) : null,
  )

  writeMarker({
    stackId,
    appliedAt: new Date().toISOString(),
    source: manifest.source,
    copiedFiles,
    packageJsonBackup: packageBackup,
  })

  console.log(`Applied. ${copiedFiles.length} file(s) copied.`)
  console.log('다음 단계:')
  console.log('  1. npm install')
  console.log('  2. npm run guard')
}

function removeEmptyParents(absPath) {
  let dir = path.dirname(absPath)

  while (dir.startsWith(repoRoot) && dir !== repoRoot) {
    try {
      fs.rmdirSync(dir)
      dir = path.dirname(dir)
    } catch {
      break
    }
  }
}

function commandReset() {
  const marker = readMarker()

  if (!marker) {
    console.log('적용된 스택이 없습니다.')
    return
  }

  let removed = 0

  for (const rel of marker.copiedFiles ?? []) {
    const abs = path.join(repoRoot, rel)

    if (fs.existsSync(abs)) {
      fs.unlinkSync(abs)
      removed += 1
      removeEmptyParents(abs)
    }
  }

  restorePackageJson(marker.packageJsonBackup)
  deleteMarker()

  console.log(`Reset complete. ${removed} file(s) removed. package.json도 적용 전 상태로 복원했습니다.`)
  console.log('node_modules는 자동으로 정리하지 않습니다. 필요 시 수동으로 npm install 또는 rm -rf node_modules를 수행하세요.')
}

if (isStatus) {
  commandStatus()
} else if (isReset) {
  commandReset()
} else {
  commandApply()
}
