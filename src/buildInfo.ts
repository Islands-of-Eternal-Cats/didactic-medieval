import { getCoreBuildInfo } from '../pkg/core'

export type BuildInfo = {
  layer: 'frontend' | 'core'
  version: string
}

export type CombinedBuildInfo = {
  frontend: BuildInfo
  core: BuildInfo
}

export function getFrontendBuildInfo(): BuildInfo {
  return __FRONTEND_BUILD_INFO__
}

export function getBuildInfo(): CombinedBuildInfo {
  const frontend = getFrontendBuildInfo()
  const core = JSON.parse(getCoreBuildInfo()) as BuildInfo
  return { frontend, core }
}

export function formatBuildLabel(info: BuildInfo): string {
  return `${info.layer}: ${info.version}`
}
