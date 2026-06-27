type SpeedControlsProps = {
  gameSpeed: number
  onChange: (speed: number) => void
}

const speeds: { label: string; value: number }[] = [
  { label: '⏸ Пауза', value: 0 },
  { label: 'x1', value: 1 },
  { label: 'x5', value: 5 },
  { label: 'x10', value: 10 },
]

export function SpeedControls({ gameSpeed, onChange }: SpeedControlsProps) {
  return (
    <div className="speed-controls">
      {speeds.map(({ label, value }) => (
        <button
          key={value}
          type="button"
          className={gameSpeed === value ? 'active' : undefined}
          onClick={() => onChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
