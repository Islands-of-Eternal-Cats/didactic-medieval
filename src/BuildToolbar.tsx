import type { BuildMode } from './UnitsCanvas'

type BuildToolbarProps = {
  mode: BuildMode
  onSelect: (mode: BuildMode) => void
}

export function BuildToolbar({ mode, onSelect }: BuildToolbarProps) {
  return (
    <div className="build-toolbar">
      <button
        className={mode === 'wall' ? 'active' : ''}
        onClick={() => onSelect(mode === 'wall' ? null : 'wall')}
      >
        Стена
      </button>
      <button
        className={mode === 'bed' ? 'active' : ''}
        onClick={() => onSelect(mode === 'bed' ? null : 'bed')}
      >
        Кровать
      </button>
      <button
        className={mode === 'campfire' ? 'active' : ''}
        onClick={() => onSelect(mode === 'campfire' ? null : 'campfire')}
      >
        Костёр
      </button>
      {mode && (
        <button
          className="cancel-btn"
          onClick={() => onSelect(null)}
        >
          Отмена
        </button>
      )}
    </div>
  )
}
