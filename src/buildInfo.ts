import frontendBuildInfo from 'virtual:frontend-build-info'
import { getCoreBuildInfo } from '../pkg/game_core'

export type BuildInfo = {
  layer: 'frontend' | 'core'
  version: string
}

export type CombinedBuildInfo = {
  frontend: BuildInfo
  core: BuildInfo
}

export function getFrontendBuildInfo(): BuildInfo {
  return frontendBuildInfo
}

export function getBuildInfo(): CombinedBuildInfo {
  const frontend = getFrontendBuildInfo()
  const core = JSON.parse(getCoreBuildInfo()) as BuildInfo
  return { frontend, core }
}

export function formatBuildLabel(info: BuildInfo): string {
  return `${info.layer}: ${info.version}`
}
