/// <reference types="vite/client" />

declare module 'virtual:frontend-build-info' {
  const info: {
    layer: 'frontend'
    version: string
  }
  export default info
}
