/**
 * CyberField — a labeled input or textarea following the cybercore design.
 *
 * Props:
 *  label      — string for the <label>
 *  value      — controlled value
 *  onChange   — (value: string) => void
 *  type       — input type (default "text")
 *  textarea   — render as <textarea> instead of <input>
 *  colSpan    — span full grid width (sets gridColumn: "1 / -1")
 *  rows       — textarea rows (default 3)
 *  placeholder
 *  disabled
 */
export default function CyberField({
  label,
  value,
  onChange,
  type = "text",
  textarea = false,
  colSpan = false,
  rows = 3,
  placeholder,
  disabled = false,
}) {
  const containerStyle = colSpan ? { gridColumn: "1 / -1" } : {};

  return (
    <div style={containerStyle}>
      {label && <label className="cyber-label">{label}</label>}
      {textarea ? (
        <textarea
          className="cyber-input"
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          style={{ resize: "vertical" }}
        />
      ) : (
        <input
          className="cyber-input"
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
    </div>
  );
}
