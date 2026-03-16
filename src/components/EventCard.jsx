import { useState } from "react";

/**
 * EventCard — clickable card shown on the View Events page.
 *
 * Props: event, onClick, onDelete
 */
export default function EventCard({ event, onClick, onDelete }) {
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

      {/* Status + Rounds row */}
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

      {/* Delete button — below the rounds row, pinned to bottom-right */}
      {onDelete && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            style={{
              background: "rgba(255,0,60,0.06)",
              border: "1px solid rgba(255,0,60,0.25)",
              color: "var(--cyber-red)",
              fontFamily: "'Orbitron', monospace",
              fontSize: 8,
              letterSpacing: 1,
              padding: "4px 12px",
              cursor: "pointer",
              transition: "background 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,0,60,0.16)";
              e.currentTarget.style.borderColor = "rgba(255,0,60,0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,0,60,0.06)";
              e.currentTarget.style.borderColor = "rgba(255,0,60,0.25)";
            }}
          >
            ✕ DELETE
          </button>
        </div>
      )}
    </div>
  );
}