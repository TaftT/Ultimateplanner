const MOODS = ['😞', '😕', '😐', '🙂', '😄']

export function MoodSelector({ mood, onChange }) {
  return (
    <div className="mood-selector">
      {MOODS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          className={`mood-button ${mood === emoji ? 'selected' : ''}`}
          onClick={() => onChange(mood === emoji ? null : emoji)}
          aria-label={`Mood: ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}
