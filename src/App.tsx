import { getProgramName } from '../pkg/core'
import './App.css'

function App() {
  return (
    <main className="app">
      <h1>{getProgramName()}</h1>
    </main>
  )
}

export default App
