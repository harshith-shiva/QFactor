import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CyberHeader from "../components/CyberHeader.jsx";
import TeamCard from "../components/TeamCard.jsx";
import RankRow from "../components/RankRow.jsx";
import { useDB } from "../hooks/useDB.js";
import {
  getTotalScore,
  getRoundScore,
  rankByTotal,
  rankByRound,
  actionPoints,
} from "../lib/scoreUtils.js";

export default function EventRoundPage() {
  const { eventId, roundIndex } = useParams();
  const navigate  = useNavigate();
  const db        = useDB();

  const currentRoundIdx = Number(roundIndex ?? 0);

  // ── Data ───────────────────────────────────────────────────────────────────
  const [event,   setEvent]   = useState(null);
  const [rounds,  setRounds]  = useState([]);
  const [teams,   setTeams]   = useState([]);
  const [scores,  setScores]  = useState([]);
  const [loading, setLoading] = useState(true);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [questionNum, setQuestionNum] = useState(0);
  const [showStats,   setShowStats]   = useState(false);
  const [bonusTeamId, setBonusTeamId] = useState(null);
  const [bonusPts,    setBonusPts]    = useState("");
  const [sortMode,    setSortMode]    = useState("default");
  const [filterText,  setFilterText]  = useState("");

  // ── Load ───────────────────────────────────────────────────────────────────
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

  const currentRound  = rounds[currentRoundIdx];
  const isLastRound   = currentRoundIdx === rounds.length - 1;
  const maxScore      = Math.max(...teams.map((t) => getTotalScore(scores, t.id)), 1);

  // ── Scoring action ─────────────────────────────────────────────────────────
  async function handleAction(teamId, actionType) {
    if (!currentRound) return;
    const pts = actionPoints(actionType, currentRound);
    const newScore = await db.addScore({
      event_id: eventId,
      round_id: currentRound.id,
      team_id: teamId,
      question_number: questionNum,
      action_type: actionType,
      points: pts,
    });
    setScores((prev) => [...prev, newScore]);
    setQuestionNum((q) => Math.min(q + 1, currentRound.num_questions ?? 99));
  }

  // ── Bonus ──────────────────────────────────────────────────────────────────
  async function handleBonus() {
    const pts = Number(bonusPts);
    if (!pts || !bonusTeamId || !currentRound) return;
    const newScore = await db.addScore({
      event_id: eventId,
      round_id: currentRound.id,
      team_id: bonusTeamId,
      question_number: questionNum,
      action_type: "bonus",
      points: pts,
    });
    setScores((prev) => [...prev, newScore]);
    setBonusTeamId(null);
    setBonusPts("");
  }

  // ── Filtered + sorted display teams ───────────────────────────────────────
  let displayTeams = [...teams];
  if (filterText) {
    displayTeams = displayTeams.filter((t) =>
      t.name.toLowerCase().includes(filterText.toLowerCase())
    );
  }
  if (sortMode === "score_desc") {
    displayTeams.sort((a, b) => getTotalScore(scores, b.id) - getTotalScore(scores, a.id));
  } else if (sortMode === "score_asc") {
    displayTeams.sort((a, b) => getTotalScore(scores, a.id) - getTotalScore(scores, b.id));
  } else if (sortMode === "alpha") {
    displayTeams.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Rankings (used in popup + top-rank highlight)
  const rankedOverall = rankByTotal(teams, scores);
  const rankedRound   = currentRound ? rankByRound(teams, scores, currentRound.id) : [];
  const rankMap       = Object.fromEntries(rankedOverall.map((t) => [t.id, t.rank]));

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
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

  return (
    <div
      className="grid-bg"
      style={{ minHeight: "100vh", background: "var(--cyber-bg)", paddingBottom: 90 }}
    >
      <CyberHeader
        title={`${event?.name ?? "EVENT"} · ${currentRound?.name ?? "ROUND"}`}
        backTo="/admin/events"
        extra={
          <div
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 13,
              color: "var(--cyber-yellow)",
              letterSpacing: 2,
              background: "rgba(255,215,0,0.08)",
              padding: "4px 12px",
              border: "1px solid rgba(255,215,0,0.3)",
            }}
          >
            Q{String(questionNum).padStart(2, "0")}
          </div>
        }
      />

      {/* ── Sort / Filter bar ── */}
      <div
        style={{
          background: "var(--cyber-panel)",
          borderBottom: "1px solid var(--cyber-border)",
          padding: "10px 24px",
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <input
          className="cyber-input"
          placeholder="FILTER TEAMS..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          style={{ width: 200, padding: "6px 10px", fontSize: 11 }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          {[
            ["default",    "DEFAULT"],
            ["score_desc", "SCORE ↓"],
            ["score_asc",  "SCORE ↑"],
            ["alpha",      "A → Z"],
          ].map(([mode, label]) => (
            <button
              key={mode}
              className="cyber-btn"
              onClick={() => setSortMode(mode)}
              style={{
                padding: "5px 10px",
                fontSize: 9,
                background: sortMode === mode ? "var(--cyber-glow)" : "transparent",
                color: sortMode === mode ? "var(--cyber-bg)" : "var(--cyber-glow)",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Question progress */}
        {currentRound?.num_questions && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 11,
                color: "var(--cyber-dim)",
              }}
            >
              {questionNum}/{currentRound.num_questions} QS
            </span>
            <div className="progress-bar" style={{ width: 100 }}>
              <div
                className="progress-fill"
                style={{
                  width: `${(questionNum / currentRound.num_questions) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Team Cards ── */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: 24,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        {displayTeams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            totalScore={getTotalScore(scores, team.id)}
            roundScore={currentRound ? getRoundScore(scores, team.id, currentRound.id) : 0}
            maxScore={maxScore}
            rank={rankMap[team.id] ?? 99}
            roundConfig={currentRound}
            onAction={handleAction}
            onBonus={setBonusTeamId}
          />
        ))}
      </div>

      {/* ── Bottom navigation ── */}
      <div
        style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          background: "rgba(6,15,26,0.98)",
          borderTop: "1px solid var(--cyber-border)",
          padding: "12px 24px",
          display: "flex",
          justifyContent: "center",
          gap: 16,
          zIndex: 50,
        }}
      >
        <button
          className="cyber-btn"
          onClick={() =>
            navigate(`/admin/events/${eventId}/round/${currentRoundIdx}/stats`)
          }
        >
          {isLastRound ? "FINAL STATS ◆" : "VIEW STATS ◆"}
        </button>
        {!isLastRound && (
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

      {/* ── Floating stats button ── */}
      <button
        className="float-btn"
        onClick={() => setShowStats(true)}
        title="Live Rankings"
      >
        ⚡
      </button>

      {/* ── Live Stats popup ── */}
      {showStats && (
        <div className="modal-overlay" onClick={() => setShowStats(false)}>
          <div
            className="cyber-panel"
            style={{
              width: "100%",
              maxWidth: 600,
              maxHeight: "80vh",
              overflow: "auto",
              padding: 32,
              borderRadius: 2,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <span
                style={{
                  fontFamily: "'Orbitron', monospace",
                  color: "var(--cyber-glow)",
                  fontSize: 14,
                }}
              >
                ⚡ LIVE RANKINGS
              </span>
              <button
                onClick={() => setShowStats(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--cyber-dim)",
                  cursor: "pointer",
                  fontSize: 18,
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <div
                  style={{
                    fontFamily: "'Orbitron', monospace",
                    fontSize: 10,
                    color: "var(--cyber-glow2)",
                    marginBottom: 12,
                    letterSpacing: 2,
                  }}
                >
                  OVERALL
                </div>
                {rankedOverall.map((t) => (
                  <RankRow key={t.id} rank={t.rank} name={t.name} score={t.totalScore} />
                ))}
              </div>
              {currentRound && (
                <div>
                  <div
                    style={{
                      fontFamily: "'Orbitron', monospace",
                      fontSize: 10,
                      color: "var(--cyber-yellow)",
                      marginBottom: 12,
                      letterSpacing: 2,
                    }}
                  >
                    THIS ROUND
                  </div>
                  {rankedRound.map((t) => (
                    <RankRow key={t.id} rank={t.rank} name={t.name} score={t.roundScore} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Bonus popup ── */}
      {bonusTeamId && (
        <div className="modal-overlay">
          <div
            className="cyber-panel"
            style={{ padding: 32, width: 320, borderRadius: 2 }}
          >
            <div
              style={{
                fontFamily: "'Orbitron', monospace",
                color: "var(--cyber-glow2)",
                fontSize: 14,
                marginBottom: 20,
              }}
            >
              BONUS POINTS
            </div>
            <div
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 11,
                color: "var(--cyber-dim)",
                marginBottom: 16,
              }}
            >
              Team: {teams.find((t) => t.id === bonusTeamId)?.name}
            </div>
            <label className="cyber-label">Points (can be negative)</label>
            <input
              className="cyber-input"
              type="number"
              value={bonusPts}
              onChange={(e) => setBonusPts(e.target.value)}
              autoFocus
              style={{ marginBottom: 20 }}
              onKeyDown={(e) => e.key === "Enter" && handleBonus()}
            />
            <div style={{ display: "flex", gap: 12 }}>
              <button
                className="cyber-btn"
                onClick={() => { setBonusTeamId(null); setBonusPts(""); }}
              >
                CANCEL
              </button>
              <button
                className="cyber-btn success"
                onClick={handleBonus}
                disabled={!bonusPts}
              >
                APPLY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
