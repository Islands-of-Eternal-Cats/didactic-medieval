import { execSync } from 'child_process'

function hasUncommittedChanges(path: string): boolean {
  try {
    const status = execSync(
      `git status --porcelain -- ${path}`,
      {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      },
    ).trim()
    return status.length > 0
  } catch {
    return false
  }
}

export function gitBuildVersion(path: string): string {
  try {
    if (hasUncommittedChanges(path)) {
      const now = new Date()
      const fmt = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}.${String(now.getUTCHours()).padStart(2, '0')}${String(now.getUTCMinutes()).padStart(2, '0')}${String(now.getUTCSeconds()).padStart(2, '0')}`
      return fmt
    }
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
