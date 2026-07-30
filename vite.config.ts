import path from 'node:path'
import { defineConfig, type Plugin, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import { gitBuildVersion } from './scripts/git-build-version'

const VIRTUAL_FRONTEND_BUILD_INFO = 'virtual:frontend-build-info'
const RESOLVED_VIRTUAL_FRONTEND_BUILD_INFO = '\0' + VIRTUAL_FRONTEND_BUILD_INFO
const FRONTEND_GIT_PATH = 'src/'
const GIT_WATCH_PATHS = ['.git/HEAD', '.git/refs/heads']

function isGitWatchPath(file: string): boolean {
  const normalized = file.replaceAll('\\', '/')
  return (
    normalized.endsWith('.git/HEAD') ||
    normalized.includes('.git/refs/heads/')
  )
}

function frontendBuildInfoPlugin(): Plugin {
  let server: ViteDevServer | undefined

  function frontendBuildInfo() {
    return {
      layer: 'frontend' as const,
      version: gitBuildVersion(FRONTEND_GIT_PATH),
    }
  }

  function invalidateFrontendBuildInfo() {
    if (!server) return
    const mod = server.moduleGraph.getModuleById(
      RESOLVED_VIRTUAL_FRONTEND_BUILD_INFO,
    )
    if (mod) {
      server.moduleGraph.invalidateModule(mod)
    }
    server.ws.send({ type: 'full-reload' })
  }

  return {
    name: 'frontend-build-info',
    configureServer(devServer) {
      server = devServer
      for (const gitPath of GIT_WATCH_PATHS) {
        devServer.watcher.add(path.resolve(gitPath))
      }
      devServer.watcher.on('change', (file) => {
        if (isGitWatchPath(file)) {
          invalidateFrontendBuildInfo()
        }
      })
    },
    resolveId(id) {
      if (id === VIRTUAL_FRONTEND_BUILD_INFO) {
        return RESOLVED_VIRTUAL_FRONTEND_BUILD_INFO
      }
    },
    load(id) {
      if (id === RESOLVED_VIRTUAL_FRONTEND_BUILD_INFO) {
        return `export default ${JSON.stringify(frontendBuildInfo())}`
      }
    },
  }
}

export default defineConfig({
  plugins: [frontendBuildInfoPlugin(), react(), wasm()],
})
