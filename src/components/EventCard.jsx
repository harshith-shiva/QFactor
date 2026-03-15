import { useState } from "react";

/**
 * EventCard — clickable card shown on the View Events page.
 *
 * Props: event, onClick
 */
export default function EventCard({ event, onClick }) {
  const [hovered, setHovered] = useState(false);

  const statusColor =
    event.status === "completed"
      ? "var(--cyber-green)"
      : event.status === "active"
      ? "var(--cyber-yellow)"
      : "var(--cyber-dim)";

  return (
    <div
      className="cyber-panel"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: 24,
        cursor: "pointer",
        borderTop: `2px solid ${statusColor}`,
        borderRadius: 2,
        transition: "all 0.2s",
        transform: hovered ? "translateY(-3px)" : "none",
        boxShadow: hovered ? "0 12px 30px rgba(0,245,255,0.08)" : "none",
      }}
    >
      <div
        style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: 14,
          color: "var(--cyber-text)",
          marginBottom: 6,
        }}
      >
        {event.name}
      </div>

      <div
        style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 11,
          color: "var(--cyber-dim)",
          marginBottom: 14,
        }}
      >
        {event.date_time
          ? new Date(event.date_time).toLocaleString()
          : "Date TBD"}
      </div>

      {event.description && (
        <div
          style={{
            fontSize: 13,
            color: "var(--cyber-dim)",
            marginBottom: 14,
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {event.description}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: 9,
            color: statusColor,
            letterSpacing: 2,
            background: `${statusColor}18`,
            padding: "4px 8px",
            border: `1px solid ${statusColor}44`,
          }}
        >
          {(event.status ?? "upcoming").toUpperCase()}
        </span>
        <span
          style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 11,
            color: "var(--cyber-dim)",
          }}
        >
          {event.num_rounds} ROUNDS
        </span>
      </div>
    </div>
  );
}
