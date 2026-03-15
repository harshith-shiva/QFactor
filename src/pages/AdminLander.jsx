import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CyberHeader from "../components/CyberHeader.jsx";

export default function AdminLander() {
  const navigate = useNavigate();

  return (
    <div
      className="grid-bg"
      style={{
        minHeight: "100vh",
        background: "var(--cyber-bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CyberHeader title="ADMIN CONSOLE" />

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
        }}
      >
        <div className="page-enter" style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 11,
              color: "var(--cyber-dim)",
              letterSpacing: 4,
              marginBottom: 12,
            }}
          >
            SYSTEM READY
          </div>
          <div
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 36,
              color: "var(--cyber-glow)",
              fontWeight: 900,
              marginBottom: 8,
              textShadow: "0 0 30px var(--cyber-glow)",
            }}
          >
            QFACTOR
          </div>
          <div
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 16,
              color: "var(--cyber-dim)",
              marginBottom: 60,
              letterSpacing: 2,
            }}
          >
            Quiz Event Management System
          </div>

          <div
            style={{
              display: "flex",
              gap: 24,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <ActionCard
              icon="⊕"
              title="CREATE EVENT"
              desc="Configure a new quiz event with rounds, teams, and scoring rules"
              color="var(--cyber-glow)"
              onClick={() => navigate("/admin/create")}
            />
            <ActionCard
              icon="◈"
              title="VIEW EVENTS"
              desc="Browse existing events, track live scores, or review final stats"
              color="var(--cyber-glow2)"
              onClick={() => navigate("/admin/events")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon, title, desc, color, onClick }) {
  const [hovered, setHovered] = useState(false);
  const rgb = color === "var(--cyber-glow)" ? "0,245,255" : "123,47,255";

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 260,
        padding: 36,
        background: hovered ? `rgba(${rgb},0.08)` : "var(--cyber-panel)",
        border: `1px solid ${hovered ? color : "var(--cyber-border)"}`,
        borderTop: `3px solid ${color}`,
        cursor: "pointer",
        transition: "all 0.2s",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? `0 16px 40px rgba(${rgb},0.15)` : "none",
        textAlign: "left",
      }}
    >
      <div style={{ fontSize: 32, color, marginBottom: 16 }}>{icon}</div>
      <div
        style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: 13,
          color,
          letterSpacing: 2,
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 13,
          color: "var(--cyber-dim)",
          lineHeight: 1.5,
        }}
      >
        {desc}
      </div>
    </div>
  );
}
