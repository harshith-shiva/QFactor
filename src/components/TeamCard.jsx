/**
 * TeamCard — live scoring card shown on EventRoundPage.
 *
 * Props:
 *  team         — { id, name, lead_name }
 *  totalScore   — cumulative points across all rounds
 *  roundScore   — points scored in the current round only
 *  maxScore     — highest total across all teams (for the progress bar)
 *  rank         — 1-based rank by total score
 *  roundConfig  — { bounce_plus, pounce_plus, pounce_minus }
 *  onAction     — (teamId, actionType) => void
 *  onBonus      — (teamId) => void
 */
export default function TeamCard({
  team,
  totalScore,
  roundScore,
  maxScore,
  rank,
  roundConfig,
  onAction,
  onBonus,
}) {
  const isTop = rank === 1;
  const { bounce_plus = 10, pounce_plus = 20, pounce_minus = 5 } = roundConfig ?? {};

  return (
    <div className={`team-card${isTop ? " top-rank" : ""}`} style={{ borderRadius: 2 }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 13,
              color: isTop ? "var(--cyber-yellow)" : "var(--cyber-text)",
              marginBottom: 2,
            }}
          >
            {team.name}
          </div>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: "var(--cyber-dim)" }}>
            {team.lead_name || "—"}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 22,
              fontWeight: 900,
              color: isTop ? "var(--cyber-yellow)" : "var(--cyber-glow)",
              lineHeight: 1,
            }}
          >
            {totalScore}
          </div>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: "var(--cyber-dim)", marginTop: 2 }}>
            +{roundScore} this round
          </div>
        </div>
      </div>

      {/* ── Score bar ── */}
      <div className="progress-bar" style={{ marginBottom: 14 }}>
        <div
          className="progress-fill"
          style={{ width: maxScore > 0 ? `${(totalScore / maxScore) * 100}%` : "0%" }}
        />
      </div>

      {/* ── Action buttons row 1 ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 6 }}>
        <ActionBtn label="+BOUNCE" sub={`+${bounce_plus}`} cls="success" onClick={() => onAction(team.id, "bounce_plus")} />
        <ActionBtn label="+POUNCE" sub={`+${pounce_plus}`} cls="success" onClick={() => onAction(team.id, "pounce_plus")} />
        <ActionBtn label="-POUNCE" sub={`-${pounce_minus}`} cls="danger"  onClick={() => onAction(team.id, "pounce_minus")} />
      </div>

      {/* ── Action buttons row 2 ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
        <ActionBtn label="+BUZZER" sub={`+${bounce_plus}`}  cls="yellow"  onClick={() => onAction(team.id, "buzzer_plus")} />
        <ActionBtn label="-BUZZER" sub={`-${pounce_minus}`} cls="danger"  onClick={() => onAction(team.id, "buzzer_minus")} />
        <ActionBtn label="BONUS"   sub="custom"             cls="purple"  onClick={() => onBonus(team.id)} />
      </div>
    </div>
  );
}

function ActionBtn({ label, sub, cls, onClick }) {
  return (
    <button
      className={`cyber-btn ${cls}`}
      onClick={onClick}
      style={{ padding: "8px 4px", fontSize: 9, clipPath: "none", lineHeight: 1.4 }}
    >
      {label}
      <br />
      <span style={{ fontSize: 8, opacity: 0.7 }}>{sub}</span>
    </button>
  );
}
