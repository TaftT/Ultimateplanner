const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function RecurrenceEditor({ recurrence, defaultStartDate, onChange }) {
  const enabled = Boolean(recurrence)

  const toggleEnabled = (checked) => {
    if (checked) {
      onChange({
        freq: 'daily',
        interval: 1,
        byWeekday: null,
        startDate: defaultStartDate,
        endDate: null,
        time: null,
      })
    } else {
      onChange(null)
    }
  }

  const update = (patch) => onChange({ ...recurrence, ...patch })

  return (
    <div className="recurrence-editor">
      <label className="reminder-toggle">
        <input type="checkbox" checked={enabled} onChange={(e) => toggleEnabled(e.target.checked)} />
        Repeats
      </label>

      {enabled && (
        <div className="recurrence-fields">
          <div className="recurrence-row">
            <span>Every</span>
            <input
              type="number"
              min={1}
              value={recurrence.interval}
              onChange={(e) => update({ interval: Math.max(1, Number(e.target.value)) })}
              className="recurrence-interval-input"
            />
            <select value={recurrence.freq} onChange={(e) => update({ freq: e.target.value })}>
              <option value="daily">day(s)</option>
              <option value="weekly">week(s)</option>
              <option value="monthly">month(s)</option>
            </select>
          </div>

          {recurrence.freq === 'weekly' && (
            <div className="weekday-picker">
              {WEEKDAY_LABELS.map((label, idx) => {
                const selected = (recurrence.byWeekday ?? []).includes(idx)
                return (
                  <button
                    type="button"
                    key={idx}
                    className={`weekday-chip ${selected ? 'selected' : ''}`}
                    onClick={() => {
                      const current = recurrence.byWeekday ?? []
                      const next = selected ? current.filter((d) => d !== idx) : [...current, idx]
                      update({ byWeekday: next })
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          )}

          <div className="recurrence-row">
            <span>Ends</span>
            <input
              type="date"
              value={recurrence.endDate ?? ''}
              onChange={(e) => update({ endDate: e.target.value || null })}
            />
            {recurrence.endDate && (
              <button type="button" className="btn btn-subtle" onClick={() => update({ endDate: null })}>
                Never
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
