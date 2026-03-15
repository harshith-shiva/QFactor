import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CyberHeader from "../components/CyberHeader.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { useDB } from "../hooks/useDB.js";
import { getTotalScore, getRoundScore, rankByTotal } from "../lib/scoreUtils.js";

export default function FinalStatsPage() {
  const { eventId } = useParams();
  const navigate    = useNavigate();
  const db          = useDB();

  const [event,   setEvent]   = useState(null);
  const [rounds,  setRounds]  = useState([]);
  const [teams,   setTeams]   = useState([]);
  const [scores,  setScores]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [ev, r, t, s] = await Promise.all([
        db.getEvent(eventId),
        db.getRounds(eventId),
        db.getTeams(eventId),
        db.getScores(eventId),
      ]);
      setEvent(ev);
      setRounds(r ?? []);
      setTeams(t ?? []);
      setScores(s ?? []);
      setLoading(false);
    }
    load();
  }, [eventId]);

  if (loading) return <Loader />;

  const ranked   = rankByTotal(teams, scores);
  const maxScore = Math.max(...ranked.map((t) => t.totalScore), 1);

  const PODIUM_ORDER   = [ranked[1], ranked[0], ranked[2]].filter(Boolean);
  const PODIUM_HEIGHTS = [110, 150, 80];
  const PODIUM_COLORS  = ["#c0c0c0", "#ffd700", "#cd7f32"];
  const PODIUM_LABELS  = ["2nd", "1st", "3rd"];

  return (
    <div
      className="grid-bg"
      style={{ minHeight: "100vh", background: "var(--cyber-bg)" }}
    >
      <CyberHeader
        title="FINAL STANDINGS"
        backTo="/admin/events"
      />

      <div
        className="page-enter"
        style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}
      >
        {/* ── Title ── */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 11,
              color: "var(--cyber-dim)",
              letterSpacing: 4,
              marginBottom: 8,
            }}
          >
            QFACTOR EVENT COMPLETE
          </div>
          <div
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 32,
              color: "var(--cyber-glow)",
              fontWeight: 900,
              textShadow: "0 0 30px var(--cyber-glow)",
            }}
          >
            {event?.name ?? "EVENT"}
          </div>
        </div>

        {/* ── Podium ── */}
        {ranked.length >= 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
              gap: 12,
              marginBottom: 56,
              height: 200,
            }}
          >
            {PODIUM_ORDER.map((team, idx) => (
              <div key={team.id} style={{ textAlign: "center", width: 130 }}>
                <div
                  style={{
                    fontFamily: "'Orbitron', monospace",
                    fontSize: 11,
                    color: PODIUM_COLORS[idx],
                    marginBottom: 2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {team.name}
                </div>
                <div
                  style={{
                    fontFamily: "'Orbitron', monospace",
                    fontSize: 20,
                    color: PODIUM_COLORS[idx],
                    fontWeight: 900,
                    textShadow: `0 0 12px ${PODIUM_COLORS[idx]}`,
                    marginBottom: 6,
                  }}
                >
                  {team.totalScore}
                </div>
                <div
                  style={{
                    height: PODIUM_HEIGHTS[idx],
                    background: `${PODIUM_COLORS[idx]}22`,
                    border: `2px solid ${PODIUM_COLORS[idx]}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Orbitron', monospace",
                    fontSize: 24,
                    color: PODIUM_COLORS[idx],
                  }}
                >
                  {PODIUM_LABELS[idx]}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Full rankings table ── */}
        <div className="cyber-panel" style={{ padding: 24, borderRadius: 2 }}>
          <SectionHeader title="COMPLETE RANKINGS" icon="◆" />
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <Th style={{ width: 60 }}>RANK</Th>
                  <Th>TEAM</Th>
                  {rounds.map((r) => (
                    <Th key={r.id} style={{ fontSize: 9 }}>
                      {r.name}
                    </Th>
                  ))}
                  <Th style={{ color: "var(--cyber-glow)", textAlign: "right" }}>
                    TOTAL
                  </Th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((team, i) => (
                  <tr key={team.id} style={{ borderBottom: "1px solid var(--cyber-border)" }}>
                    <Td style={{ textAlign: "center" }}>
                      <span className={i < 3 ? ["rank-1","rank-2","rank-3"][i] : ""}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                      </span>
                    </Td>
                    <Td>
                      <div
                        style={{
                          fontFamily: "'Rajdhani', sans-serif",
                          fontSize: 15,
                          fontWeight: 600,
                        }}
                      >
                        {team.name}
                      </div>
                      {team.lead_name && (
                        <div
                          style={{
                            fontFamily: "'Share Tech Mono', monospace",
                            fontSize: 10,
                            color: "var(--cyber-dim)",
                          }}
                        >
                          {team.lead_name}
                        </div>
                      )}
                    </Td>
                    {rounds.map((r) => (
                      <Td
                        key={r.id}
                        style={{
                          textAlign: "center",
                          fontFamily: "'Share Tech Mono', monospace",
                          fontSize: 12,
                          color: "var(--cyber-dim)",
                        }}
                      >
                        {getRoundScore(scores, team.id, r.id)}
                      </Td>
                    ))}
                    <Td style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontFamily: "'Orbitron', monospace",
                          fontSize: 18,
                          fontWeight: 900,
                          color: i === 0 ? "var(--cyber-yellow)" : "var(--cyber-glow)",
                        }}
                      >
                        {team.totalScore}
                      </div>
                      <div className="progress-bar" style={{ marginTop: 4 }}>
                        <div
                          className="progress-fill"
                          style={{ width: `${(team.totalScore / maxScore) * 100}%` }}
                        />
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <button
            className="cyber-btn"
            onClick={() => navigate("/admin/events")}
          >
            ← BACK TO EVENTS
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tiny table cell helpers ──────────────────────────────────────────────────
function Th({ children, style }) {
  return (
    <th
      style={{
        fontFamily: "'Orbitron', monospace",
        fontSize: 10,
        color: "var(--cyber-dim)",
        letterSpacing: 1,
        padding: "10px 12px",
        textAlign: "left",
        borderBottom: "1px solid var(--cyber-border)",
        ...style,
      }}
    >
      {children}
    </th>
  );
}

function Td({ children, style }) {
  return (
    <td
      style={{
        padding: "12px 12px",
        color: "var(--cyber-text)",
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: 14,
        ...style,
      }}
    >
      {children}
    </td>
  );
}

function Loader() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--cyber-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--cyber-glow)",
        fontFamily: "'Orbitron', monospace",
        fontSize: 14,
        letterSpacing: 4,
      }}
    >
      LOADING...
    </div>
  );
}
