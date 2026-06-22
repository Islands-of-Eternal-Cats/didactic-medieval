import { useEffect, useState } from 'react'
import { getProgramName } from '../pkg/core'
import {
  formatBuildLabel,
  getBuildInfo,
  type CombinedBuildInfo,
} from './buildInfo'
import { UnitsCanvas } from './UnitsCanvas'
import './App.css'

function App() {
  const [greeting, setGreeting] = useState('')
  const [buildInfo, setBuildInfo] = useState<CombinedBuildInfo | null>(null)
  const [seed, setSeed] = useState(() => Date.now())

  useEffect(() => {
    setGreeting(getProgramName())
    setBuildInfo(getBuildInfo())
  }, [])

  return (
    <main className="app">
      <h1>{greeting}</h1>
      <UnitsCanvas seed={seed} onRegenerate={() => setSeed(Date.now())} />
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
