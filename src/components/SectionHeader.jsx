/** Section divider with an icon, title, and a horizontal rule. */
export default function SectionHeader({ title, icon = "◉", style }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, ...style }}>
      <span style={{ color: "var(--cyber-glow)", fontSize: 14 }}>{icon}</span>
      <span
        style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: 11,
          color: "var(--cyber-glow)",
          letterSpacing: 3,
          whiteSpace: "nowrap",
        }}
      >
        {title}
      </span>
      <div style={{ flex: 1, height: 1, background: "var(--cyber-border)" }} />
    </div>
  );
}
