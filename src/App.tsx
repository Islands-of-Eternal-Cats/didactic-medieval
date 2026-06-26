import { useCallback, useEffect, useState } from 'react'
import { getProgramName } from '../pkg/core'
import {
  formatBuildLabel,
  getBuildInfo,
  type CombinedBuildInfo,
} from './buildInfo'
import { BuildToolbar } from './BuildToolbar'
import { UnitsCanvas, type BuildMode } from './UnitsCanvas'
import './App.css'

function App() {
  const [greeting, setGreeting] = useState('')
  const [buildInfo, setBuildInfo] = useState<CombinedBuildInfo | null>(null)
  const [seed, setSeed] = useState(() => Date.now())
  const [buildMode, setBuildMode] = useState<BuildMode>(null)

  useEffect(() => {
    setGreeting(getProgramName())
    setBuildInfo(getBuildInfo())
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setBuildMode(null)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <main className="app">
      <h1>{greeting}</h1>
      <BuildToolbar mode={buildMode} onSelect={setBuildMode} />
      <UnitsCanvas seed={seed} buildMode={buildMode} onRegenerate={() => setSeed(Date.now())} />
      {buildInfo && (
        <footer className="build-info">
          <p>{formatBuildLabel(buildInfo.frontend)}</p>
          <p>{formatBuildLabel(buildInfo.core)}</p>
        </footer>
      )}
    </main>
  )
}

export default App
