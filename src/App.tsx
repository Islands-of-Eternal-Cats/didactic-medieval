import { useCallback, useEffect, useRef, useState } from 'react'
import { getProgramName } from '../pkg/game_core'
import {
  formatBuildLabel,
  getBuildInfo,
  type CombinedBuildInfo,
} from './buildInfo'
import { BuildToolbar } from './BuildToolbar'
import { SpeedControls } from './SpeedControls'
import { UnitsCanvas, type BuildMode, type UnitState } from './UnitsCanvas'
import { UnitPanel } from './UnitPanel'
import './App.css'

function App() {
  const [greeting, setGreeting] = useState('')
  const [buildInfo, setBuildInfo] = useState<CombinedBuildInfo | null>(null)
  const [seed, setSeed] = useState(() => Date.now())
  const [buildMode, setBuildMode] = useState<BuildMode>(null)
  const [gameSpeed, setGameSpeed] = useState(1)
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null)
  const [unitStates, setUnitStates] = useState<UnitState[]>([])
  const prevSpeedRef = useRef(1)

  useEffect(() => {
    setGreeting(getProgramName())
    setBuildInfo(getBuildInfo())
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setBuildMode(null)
      setSelectedUnitId(null)
      return
    }
    if (e.key === ' ') {
      e.preventDefault()
      setGameSpeed(prev => {
        if (prev === 0) return prevSpeedRef.current
        prevSpeedRef.current = prev
        return 0
      })
      return
    }
    if (e.key === '1') { setGameSpeed(1); return }
    if (e.key === '2') { setGameSpeed(5); return }
    if (e.key === '3') { setGameSpeed(10); return }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <main className="app">
      <h1>{greeting}</h1>
      <BuildToolbar mode={buildMode} onSelect={setBuildMode} />
      <SpeedControls gameSpeed={gameSpeed} onChange={setGameSpeed} />
      <div className="game-area">
        <UnitsCanvas
          seed={seed}
          buildMode={buildMode}
          gameSpeed={gameSpeed}
          onRegenerate={() => {
            setSeed(Date.now())
            setSelectedUnitId(null)
          }}
          selectedUnitId={selectedUnitId}
          onSelectUnit={setSelectedUnitId}
          onDeselectUnit={() => setSelectedUnitId(null)}
          onStateChange={setUnitStates}
        />
        {selectedUnitId !== null && (
          <UnitPanel
            unitId={selectedUnitId}
            unitStates={unitStates}
            onClose={() => setSelectedUnitId(null)}
          />
        )}
      </div>
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
