import { useEffect, useState } from 'react'
import { getProgramName } from '../pkg/core'
import {
  formatBuildLabel,
  getBuildInfo,
  type CombinedBuildInfo,
} from './buildInfo'
import './App.css'

function App() {
  const [greeting, setGreeting] = useState('')
  const [buildInfo, setBuildInfo] = useState<CombinedBuildInfo | null>(null)

  useEffect(() => {
    setGreeting(getProgramName())
    setBuildInfo(getBuildInfo())
  }, [])

  return (
    <main className="app">
      <h1>{greeting}</h1>
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
