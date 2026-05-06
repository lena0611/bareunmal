#!/usr/bin/env node

const gitlabUrl = process.env.HARNESS_GITLAB_URL ?? 'https://git.smartscore.kr'
const groupPath = process.env.HARNESS_STACK_STANDARD_GROUP ?? 'ai-standard/harnesses'
const token = process.env.GITLAB_TOKEN ?? process.env.HARNESS_GITLAB_TOKEN
const excludedProjects = new Set(
  (process.env.HARNESS_STACK_STANDARD_EXCLUDE ?? 'harness-seed')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
)

function encodeGroupPath(value) {
  return value.split('/').map(encodeURIComponent).join('%2F')
}

function printManualFallback() {
  console.log('스택 기준 목록을 자동 조회하지 못했습니다.')
  console.log('')
  console.log('사내 GitLab 스택 기준 조회 설정을 확인하세요.')
  console.log('  HARNESS_GITLAB_URL=https://git.smartscore.kr')
  console.log('  HARNESS_STACK_STANDARD_GROUP=ai-standard/harnesses')
  console.log('  GITLAB_TOKEN=<private-token>   # 비공개 그룹이거나 API 권한이 필요하면 설정')
  console.log('')
  console.log('현재 예정된 스택 기준 후보 예시:')
  console.log('  npm run stack:apply -- --preset-git https://git.smartscore.kr/ai-standard/harnesses/vue3-vite-pinia-router.git --ref v0.1.2')
  console.log('')
  console.log('다른 스택 기준을 알고 있다면 직접 지정할 수 있습니다.')
  console.log('  npm run stack:apply -- --preset-git <repo-url> --ref <tag-or-branch>')
  console.log('  npm run stack:apply -- --preset-path <local-standard-dir>')
}

async function main() {
  const url = new URL(`/api/v4/groups/${encodeGroupPath(groupPath)}/projects`, gitlabUrl)
  url.searchParams.set('include_subgroups', 'true')
  url.searchParams.set('per_page', '100')

  const headers = token ? { 'PRIVATE-TOKEN': token } : {}
  let response

  try {
    response = await fetch(url, { headers })
  } catch {
    printManualFallback()
    process.exit(0)
  }

  if (!response.ok) {
    printManualFallback()
    process.exit(0)
  }

  const projects = await response.json()
  const stackStandards = Array.isArray(projects)
    ? projects.filter((project) => !excludedProjects.has(project.path))
    : []

  if (stackStandards.length === 0) {
    console.log(`스택 기준 그룹에 후보 프로젝트가 없습니다: ${groupPath}`)
    console.log(`제외 프로젝트: ${[...excludedProjects].join(', ') || '(none)'}`)
    return
  }

  console.log(`Stack standards from ${groupPath}`)
  console.log('')

  for (const project of stackStandards) {
    const name = project.path_with_namespace ?? project.name
    const repo = project.http_url_to_repo ?? project.web_url
    const ref = project.tag_list?.[0] ?? project.default_branch ?? 'main'
    console.log(`- ${name}`)
    console.log(`  repo: ${repo}`)
    console.log(`  apply: npm run stack:apply -- --preset-git ${repo} --ref ${ref}`)
  }
}

main()
