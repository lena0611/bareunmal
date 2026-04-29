#!/usr/bin/env node

const gitlabUrl = process.env.HARNESS_GITLAB_URL ?? 'https://git.smartscore.kr'
const groupPath = process.env.HARNESS_TEMPLATE_GROUP ?? 'ai-standard/template'
const token = process.env.GITLAB_TOKEN ?? process.env.HARNESS_GITLAB_TOKEN

function encodeGroupPath(value) {
  return value.split('/').map(encodeURIComponent).join('%2F')
}

function printManualFallback() {
  console.log('템플릿 목록을 자동 조회하지 못했습니다.')
  console.log('')
  console.log('사내 GitLab 템플릿 그룹을 만들면 아래 환경값으로 조회할 수 있습니다.')
  console.log('  HARNESS_GITLAB_URL=https://git.smartscore.kr')
  console.log('  HARNESS_TEMPLATE_GROUP=ai-standard/template')
  console.log('  GITLAB_TOKEN=<private-token>   # 비공개 그룹이면 필요')
  console.log('')
  console.log('템플릿을 알고 있다면 바로 적용할 수 있습니다.')
  console.log('  npm run stack:apply -- --preset-git <repo-url> --ref <tag-or-branch>')
  console.log('  npm run stack:apply -- --preset-path <local-preset-dir>')
}

async function main() {
  const url = new URL(`/api/v4/groups/${encodeGroupPath(groupPath)}/projects`, gitlabUrl)
  url.searchParams.set('include_subgroups', 'true')
  url.searchParams.set('simple', 'true')
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
  if (!Array.isArray(projects) || projects.length === 0) {
    console.log(`템플릿 그룹에 프로젝트가 없습니다: ${groupPath}`)
    return
  }

  console.log(`Template presets from ${groupPath}`)
  console.log('')

  for (const project of projects) {
    const name = project.path_with_namespace ?? project.name
    const repo = project.http_url_to_repo ?? project.web_url
    console.log(`- ${name}`)
    console.log(`  repo: ${repo}`)
    console.log(`  apply: npm run stack:apply -- --preset-git ${repo} --ref main`)
  }
}

main()
