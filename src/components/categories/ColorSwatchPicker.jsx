import { CATEGORY_COLOR_SWATCHES } from '../../utils/colorUtils.js'

export function ColorSwatchPicker({ color, onChange }) {
  return (
    <div className="color-swatch-picker">
      {CATEGORY_COLOR_SWATCHES.map((swatch) => (
        <button
          type="button"
          key={swatch}
          className={`color-swatch ${swatch === color ? 'selected' : ''}`}
          style={{ background: swatch }}
          onClick={() => onChange(swatch)}
          aria-label={`Color ${swatch}`}
        />
      ))}
    </div>
  )
}
