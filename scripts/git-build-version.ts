import { execSync } from 'child_process'

export function gitBuildVersion(path: string): string {
  try {
    const version = execSync(
      `git log -1 --format=%cd --date=format:%Y%m%d.%H%M%S -- ${path}`,
      {
        encoding: 'utf-8',
        env: { ...process.env, TZ: 'UTC' },
        stdio: ['pipe', 'pipe', 'pipe'],
      },
    ).trim()
    return version || 'unknown'
  } catch {
    return 'unknown'
  }
}
