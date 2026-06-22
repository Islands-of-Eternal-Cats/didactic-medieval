import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import { gitBuildVersion } from './scripts/git-build-version'

function frontendBuildInfoPlugin(): Plugin {
  return {
    name: 'frontend-build-info',
    config() {
      const version = gitBuildVersion('src/')
      return {
        define: {
          __FRONTEND_BUILD_INFO__: JSON.stringify({
            layer: 'frontend',
            version,
          }),
        },
      }
    },
  }
}

export default defineConfig({
  plugins: [frontendBuildInfoPlugin(), react(), wasm(), topLevelAwait()],
})
