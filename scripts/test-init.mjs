#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const repoRoot = path.resolve(path.dirname(__filename), '..')
const nodeBin = process.execPath

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: options.cwd ?? repoRoot,
    encoding: 'utf8',
    stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'],
  })
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function exists(target, rel) {
  return fs.existsSync(path.join(target, rel))
}

function read(target, rel) {
  return fs.readFileSync(path.join(target, rel), 'utf8')
}

function makeTarget() {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-seed-init-test-'))
  run('git', ['init', '--quiet'], { cwd: target })
  return target
}

function runInit(target, ...args) {
  return run(nodeBin, [path.join(repoRoot, 'scripts/init.mjs'), 'init', ...args], { cwd: target })
}

function cleanInstallCreatesExpectedFiles() {
  const target = makeTarget()
  runInit(target)

  assert(exists(target, '.harness/policy/profile.json'), 'clean install should copy .harness')
  assert(exists(target, '.claude/settings.json'), 'clean install should copy Claude Code adapter')
  assert(exists(target, 'scripts/absorb-project.mjs'), 'clean install should copy absorb report script')
  assert(!exists(target, 'scripts/init.mjs'), 'clean install should not copy seed-only init entrypoint')
  assert(exists(target, '.harness/install-manifest.json'), 'clean install should write install manifest')

  const pkg = JSON.parse(read(target, 'package.json'))
  assert(pkg.scripts.guard, 'clean install should merge guard script')
  assert(pkg.scripts['absorb:report'], 'clean install should merge absorb report script')

  const manifest = JSON.parse(read(target, '.harness/install-manifest.json'))
  assert(manifest.tool === 'harness-seed', 'install manifest should identify harness-seed')
  assert(manifest.managedFiles['scripts/guard.mjs'], 'install manifest should record managed files')

  const status = fs.statSync(path.join(target, '.claude/hooks/statusline.sh'))
  assert((status.mode & 0o111) !== 0, 'Claude hook should be executable')
}

function reinstallPreservesProjectOwnedFiles() {
  const target = makeTarget()
  runInit(target)

  const sentinel = 'PROJECT OWNED SENTINEL\n'
  fs.writeFileSync(path.join(target, '.harness/project/project-charter.md'), sentinel)
  fs.writeFileSync(path.join(target, '.harness/project/local-methodology.md'), sentinel)
  fs.writeFileSync(path.join(target, '.harness/policy/profile.json'), '{"activeStack":"custom"}\n')

  runInit(target)

  assert(read(target, '.harness/project/project-charter.md') === sentinel, 'reinstall should preserve project charter')
  assert(read(target, '.harness/project/local-methodology.md') === sentinel, 'reinstall should preserve local methodology')
  assert(read(target, '.harness/policy/profile.json').includes('"custom"'), 'reinstall should preserve profile')
  assert(exists(target, '.harness-backup'), 'reinstall should create backup directory')
}

function forceOverwritesProjectOwnedFiles() {
  const target = makeTarget()
  runInit(target)

  fs.writeFileSync(path.join(target, '.harness/project/project-charter.md'), 'FORCE SHOULD REPLACE\n')
  runInit(target, '--force')

  assert(!read(target, '.harness/project/project-charter.md').includes('FORCE SHOULD REPLACE'), '--force should overwrite project-owned files')
}

function dryRunDoesNotWriteFiles() {
  const target = makeTarget()
  const output = runInit(target, '--dry-run')

  assert(output.includes('mode: dry-run'), 'dry-run should report dry-run mode')
  assert(!exists(target, '.harness'), 'dry-run should not write .harness')
  assert(!exists(target, 'package.json'), 'dry-run should not write package.json')
}

function noBackupRequiresForce() {
  const target = makeTarget()
  let failed = false

  try {
    runInit(target, '--no-backup')
  } catch (error) {
    failed = true
    assert(error.status === 1, '--no-backup without --force should fail with status 1')
  }

  assert(failed, '--no-backup without --force should fail')
}

function externalHarnessWithoutManifestIsPreserved() {
  const target = makeTarget()

  fs.mkdirSync(path.join(target, '.harness/policy'), { recursive: true })
  fs.writeFileSync(path.join(target, '.harness/policy/README.md'), 'EXTERNAL HARNESS\n')
  fs.writeFileSync(path.join(target, 'CLAUDE.md'), 'EXTERNAL CLAUDE\n')

  const output = runInit(target)

  assert(output.includes('install manifest'), 'external harness install should still write manifest')
  assert(output.includes('브리지 섹션 추가 후보'), 'external harness install should suggest bridge section candidates')
  assert(read(target, '.harness/policy/README.md') === 'EXTERNAL HARNESS\n', 'external harness file should be preserved')
  assert(read(target, 'CLAUDE.md') === 'EXTERNAL CLAUDE\n', 'external CLAUDE.md should be preserved')
  assert(exists(target, '.harness/install-manifest.json'), 'external harness install should write manifest for future runs')

  const manifest = JSON.parse(read(target, '.harness/install-manifest.json'))
  assert(!manifest.managedFiles['.harness/policy/README.md'], 'preserved external harness file should not become managed')
  assert(!manifest.managedFiles['CLAUDE.md'], 'preserved external CLAUDE.md should not become managed')
}

function absorbReportSuggestsBridgeCandidates() {
  const target = makeTarget()

  fs.writeFileSync(path.join(target, 'CLAUDE.md'), '# Personal Rules\n')
  runInit(target)
  run('npm', ['run', 'absorb:report'], { cwd: target })

  const report = read(target, '.harness/session/absorb-report.md')
  assert(report.includes('## Bridge Section Candidates'), 'absorb report should include bridge section candidate section')
  assert(report.includes('CLAUDE.md'), 'absorb report should suggest CLAUDE.md bridge candidate')
  assert(report.includes('Project Harness Bridge'), 'absorb report should include bridge template')
}

const tests = [
  cleanInstallCreatesExpectedFiles,
  reinstallPreservesProjectOwnedFiles,
  forceOverwritesProjectOwnedFiles,
  dryRunDoesNotWriteFiles,
  noBackupRequiresForce,
  externalHarnessWithoutManifestIsPreserved,
  absorbReportSuggestsBridgeCandidates,
]

console.log('Init smoke tests')

for (const test of tests) {
  test()
  console.log(`  OK ${test.name}`)
}
