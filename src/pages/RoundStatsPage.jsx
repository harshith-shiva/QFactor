import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CyberHeader from "../components/CyberHeader.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { useDB } from "../hooks/useDB.js";
import { getTotalScore, getRoundScore, rankByRound } from "../lib/scoreUtils.js";

export default function RoundStatsPage() {
  const { eventId, roundIndex } = useParams();
  const navigate  = useNavigate();
  const db        = useDB();

  const currentRoundIdx = Number(roundIndex ?? 0);

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

  if (loading) {
    return (
      <Loader />
    );
  }

  const currentRound = rounds[currentRoundIdx];
  const isLastRound  = currentRoundIdx === rounds.length - 1;
  const ranked       = currentRound ? rankByRound(teams, scores, currentRound.id) : [];

  const rankColors = ["var(--cyber-yellow)", "#c0c0c0", "#cd7f32"];

  return (
    <div
      className="grid-bg"
      style={{ minHeight: "100vh", background: "var(--cyber-bg)" }}
    >
      <CyberHeader
        title={`${currentRound?.name ?? "ROUND"} STATS`}
        backTo={`/admin/events/${eventId}/round/${currentRoundIdx}`}
      />

      <div
        className="page-enter"
        style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px" }}
      >
        {/* Round label */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 11,
              color: "var(--cyber-dim)",
              letterSpacing: 4,
              marginBottom: 8,
            }}
          >
            ROUND {currentRoundIdx + 1} OF {rounds.length}
          </div>
          <div
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 28,
              color: "var(--cyber-glow)",
              fontWeight: 900,
              textShadow: "0 0 20px rgba(0,245,255,0.4)",
            }}
          >
            {currentRound?.name}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="cyber-panel" style={{ padding: 24, borderRadius: 2 }}>
          <SectionHeader title="ROUND LEADERBOARD" icon="▲" />

          {ranked.map((team, i) => {
            const color = i < 3 ? rankColors[i] : "var(--cyber-border)";
            return (
              <div
                key={team.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "14px 0",
                  borderBottom: "1px solid var(--cyber-border)",
                }}
              >
                {/* Rank badge */}
                <div
                  style={{
                    width: 48, height: 48,
                    border: `2px solid ${color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Orbitron', monospace",
                    fontSize: 16,
                    color,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>

                {/* Name + total */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "'Orbitron', monospace",
                      fontSize: 13,
                      color: "var(--cyber-text)",
                      marginBottom: 2,
                    }}
                  >
                    {team.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: 10,
                      color: "var(--cyber-dim)",
                    }}
                  >
                    Cumulative: {getTotalScore(scores, team.id)} pts
                  </div>
                </div>

                {/* Round score */}
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontFamily: "'Orbitron', monospace",
                      fontSize: 24,
                      fontWeight: 900,
                      color: i === 0 ? "var(--cyber-yellow)" : "var(--cyber-glow)",
                    }}
                  >
                    {team.roundScore}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: 9,
                      color: "var(--cyber-dim)",
                    }}
                  >
                    this round
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Nav buttons */}
        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            marginTop: 32,
            flexWrap: "wrap",
          }}
        >
          <button
            className="cyber-btn"
            onClick={() =>
              navigate(`/admin/events/${eventId}/round/${currentRoundIdx}`)
            }
          >
            ← BACK TO ROUND
          </button>

          {isLastRound ? (
            <button
              className="cyber-btn yellow"
              onClick={() => navigate(`/admin/events/${eventId}/final`)}
            >
              ◆ FINAL STATS
            </button>
          ) : (
            <button
              className="cyber-btn success"
              onClick={() =>
                navigate(`/admin/events/${eventId}/round/${currentRoundIdx + 1}`)
              }
            >
              START ROUND {currentRoundIdx + 2} →
            </button>
          )}
        </div>
      </div>
    </div>
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
