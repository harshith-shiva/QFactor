import { useEffect, useState, useMemo } from "react";
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

// ── Action type labels for the audit table ────────────────────────────────────
const ACTION_LABELS = {
  bounce_plus:  "+BOUNCE",
  pounce_plus:  "+POUNCE",
  pounce_minus: "-POUNCE",
  buzzer_plus:  "+BUZZER",
  buzzer_minus: "-BUZZER",
  bonus:        "BONUS",
  skip:         "SKIP",
};

const ACTION_COLORS = {
  bounce_plus:  "var(--cyber-green)",
  pounce_plus:  "var(--cyber-green)",
  pounce_minus: "var(--cyber-red)",
  buzzer_plus:  "var(--cyber-yellow)",
  buzzer_minus: "var(--cyber-red)",
  bonus:        "var(--cyber-glow2)",
  skip:         "var(--cyber-dim)",
};

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

  // ── Audit table state ──────────────────────────────────────────────────────
  // editingId  — score row id currently being edited (null = none)
  // editDraft  — { points, question_number } live values while editing
  // savingId   — row id currently being saved to DB (shows spinner)
  // deletingId — row id currently being deleted
  const [editingId,  setEditingId]  = useState(null);
  const [editDraft,  setEditDraft]  = useState({ points: 0, question_number: 0 });
  const [savingId,   setSavingId]   = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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
      const loadedRounds = r ?? [];
      const loadedScores = s ?? [];
      setRounds(loadedRounds);
      setTeams(t ?? []);
      setScores(loadedScores);

      // Restore questionNum from the highest question_number already in DB for this round
      const thisRound = loadedRounds[currentRoundIdx];
      if (thisRound) {
        const roundScores = loadedScores.filter((sc) => sc.round_id === thisRound.id);
        if (roundScores.length > 0) {
          const maxQ = Math.max(...roundScores.map((sc) => sc.question_number ?? 0));
          setQuestionNum(maxQ + 1);
        }
      }

      setLoading(false);
    }
    load();
  }, [eventId]);

  const currentRound = rounds[currentRoundIdx];
  const isLastRound  = currentRoundIdx === rounds.length - 1;

  // maxScore recalculates automatically whenever scores changes —
  // so TeamCard progress bars stay in sync after any edit/delete
  const maxScore = useMemo(
    () => Math.max(...teams.map((t) => getTotalScore(scores, t.id)), 1),
    [scores, teams]
  );

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

  // ── Skip Question ──────────────────────────────────────────────────────────
  async function handleSkipQuestion() {
    if (!currentRound) return;
    const newScore = await db.addScore({
      event_id: eventId,
      round_id: currentRound.id,
      team_id: null,
      question_number: questionNum,
      action_type: "skip",
      points: 0,
    });
    setScores((prev) => [...prev, newScore]);
    setQuestionNum((q) => Math.min(q + 1, currentRound.num_questions ?? 99));
  }

  // ── Audit: start editing a row ─────────────────────────────────────────────
  function startEdit(row) {
    setEditingId(row.id);
    setEditDraft({ points: row.points, question_number: row.question_number });
  }

  // ── Audit: save edited row ─────────────────────────────────────────────────
  async function saveEdit(rowId) {
    setSavingId(rowId);
    const updated = await db.updateScore(rowId, {
      points: Number(editDraft.points),
      question_number: Number(editDraft.question_number),
    });
    // Patch just this one row in local state — cards re-render immediately
    setScores((prev) =>
      prev.map((s) =>
        s.id === rowId
          ? { ...s, points: Number(editDraft.points), question_number: Number(editDraft.question_number) }
          : s
      )
    );
    setEditingId(null);
    setSavingId(null);
  }

  // ── Audit: delete a row ────────────────────────────────────────────────────
  async function deleteRow(rowId) {
    setDeletingId(rowId);
    await db.deleteScore(rowId);
    // Remove from local state — cards re-render immediately
    setScores((prev) => prev.filter((s) => s.id !== rowId));
    setDeletingId(null);
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

  // Rankings (popup + top-rank highlight on cards)
  const rankedOverall = rankByTotal(teams, scores);
  const rankedRound   = currentRound ? rankByRound(teams, scores, currentRound.id) : [];
  const rankMap       = Object.fromEntries(rankedOverall.map((t) => [t.id, t.rank]));

  // Team id → name lookup for the audit table
  const teamNameMap = Object.fromEntries(teams.map((t) => [t.id, t.name]));

  // Scores for the current round only, sorted by question number then insertion order
  const currentRoundScores = useMemo(() => {
    if (!currentRound) return [];
    return [...scores]
      .filter((s) => s.round_id === currentRound.id)
      .sort((a, b) =>
        a.question_number !== b.question_number
          ? a.question_number - b.question_number
          : (a.created_at ?? "").localeCompare(b.created_at ?? "")
      );
  }, [scores, currentRound]);

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
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              className="cyber-btn"
              onClick={handleSkipQuestion}
              style={{
                padding: "6px 16px",
                fontSize: 11,
                letterSpacing: 1,
                borderColor: "rgba(255,215,0,0.4)",
                color: "var(--cyber-yellow)",
              }}
            >
              SKIP Q ▶▶
            </button>
            <div
              style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: 18,
                fontWeight: 700,
                color: "var(--cyber-yellow)",
                letterSpacing: 3,
                background: "rgba(255,215,0,0.1)",
                padding: "6px 18px",
                border: "1px solid rgba(255,215,0,0.4)",
                minWidth: 72,
                textAlign: "center",
              }}
            >
              Q{String(questionNum).padStart(2, "0")}
            </div>
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
                style={{ width: `${(questionNum / currentRound.num_questions) * 100}%` }}
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

      {/* ════════════════════════════════════════════════════════════════════
          SCORE AUDIT TABLE
          Shows every scoring action for the current round.
          Points and question number are inline-editable.
          Rows can be deleted. All changes immediately reflect in cards above.
      ════════════════════════════════════════════════════════════════════ */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 40px" }}>
        {/* Section header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div style={{ height: 1, flex: 1, background: "var(--cyber-border)" }} />
          <span
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 11,
              color: "var(--cyber-glow2)",
              letterSpacing: 3,
              whiteSpace: "nowrap",
            }}
          >
            ✦ SCORE AUDIT — {currentRound?.name ?? "CURRENT ROUND"}
          </span>
          <span
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 10,
              color: "var(--cyber-dim)",
              background: "rgba(123,47,255,0.1)",
              border: "1px solid rgba(123,47,255,0.3)",
              padding: "2px 8px",
            }}
          >
            {currentRoundScores.length} ENTRIES
          </span>
          <div style={{ height: 1, flex: 1, background: "var(--cyber-border)" }} />
        </div>

        {currentRoundScores.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "32px 0",
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 12,
              color: "var(--cyber-dim)",
              border: "1px dashed var(--cyber-border)",
            }}
          >
            NO SCORING ACTIONS YET THIS ROUND
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "var(--cyber-panel)",
                border: "1px solid var(--cyber-border)",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "2px solid var(--cyber-border)" }}>
                  {["Q#", "TEAM", "ACTION", "POINTS", ""].map((h) => (
                    <th
                      key={h}
                      style={{
                        fontFamily: "'Orbitron', monospace",
                        fontSize: 9,
                        letterSpacing: 2,
                        color: "var(--cyber-dim)",
                        padding: "10px 14px",
                        textAlign: "left",
                        background: "rgba(0,245,255,0.02)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentRoundScores.map((row, idx) => {
                  const isEditing  = editingId  === row.id;
                  const isSaving   = savingId   === row.id;
                  const isDeleting = deletingId === row.id;
                  const rowBg      = idx % 2 === 0 ? "transparent" : "rgba(0,245,255,0.015)";
                  const acColor    = ACTION_COLORS[row.action_type] ?? "var(--cyber-text)";

                  return (
                    <tr
                      key={row.id}
                      style={{
                        background: isEditing ? "rgba(123,47,255,0.08)" : rowBg,
                        borderBottom: "1px solid var(--cyber-border)",
                        transition: "background 0.15s",
                        opacity: isDeleting ? 0.4 : 1,
                      }}
                    >
                      {/* ── Q# ── */}
                      <td style={tdBase}>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editDraft.question_number}
                            onChange={(e) =>
                              setEditDraft((d) => ({ ...d, question_number: e.target.value }))
                            }
                            style={inlineInput}
                            min={0}
                          />
                        ) : (
                          <span
                            style={{
                              fontFamily: "'Orbitron', monospace",
                              fontSize: 12,
                              color: "var(--cyber-yellow)",
                              background: "rgba(255,215,0,0.08)",
                              padding: "2px 8px",
                              border: "1px solid rgba(255,215,0,0.2)",
                            }}
                          >
                            Q{String(row.question_number ?? 0).padStart(2, "0")}
                          </span>
                        )}
                      </td>

                      {/* ── Team ── */}
                      <td style={tdBase}>
                        <span
                          style={{
                            fontFamily: "'Rajdhani', sans-serif",
                            fontSize: 14,
                            fontWeight: 600,
                            color: "var(--cyber-text)",
                          }}
                        >
                          {row.team_id ? (teamNameMap[row.team_id] ?? row.team_id) : "—"}
                        </span>
                      </td>

                      {/* ── Action ── */}
                      <td style={tdBase}>
                        <span
                          style={{
                            fontFamily: "'Orbitron', monospace",
                            fontSize: 9,
                            letterSpacing: 1,
                            color: acColor,
                            background: `${acColor}18`,
                            border: `1px solid ${acColor}44`,
                            padding: "3px 8px",
                          }}
                        >
                          {ACTION_LABELS[row.action_type] ?? row.action_type}
                        </span>
                      </td>

                      {/* ── Points (editable) ── */}
                      <td style={tdBase}>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editDraft.points}
                            onChange={(e) =>
                              setEditDraft((d) => ({ ...d, points: e.target.value }))
                            }
                            style={{ ...inlineInput, width: 80 }}
                            onKeyDown={(e) => e.key === "Enter" && saveEdit(row.id)}
                          />
                        ) : (
                          <span
                            style={{
                              fontFamily: "'Orbitron', monospace",
                              fontSize: 14,
                              fontWeight: 700,
                              color: row.points >= 0 ? "var(--cyber-green)" : "var(--cyber-red)",
                            }}
                          >
                            {row.points >= 0 ? "+" : ""}
                            {row.points}
                          </span>
                        )}
                      </td>

                      {/* ── Actions ── */}
                      <td style={{ ...tdBase, textAlign: "right", whiteSpace: "nowrap" }}>
                        {isEditing ? (
                          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                            <button
                              className="cyber-btn success"
                              style={smallBtn}
                              onClick={() => saveEdit(row.id)}
                              disabled={isSaving}
                            >
                              {isSaving ? "..." : "SAVE"}
                            </button>
                            <button
                              className="cyber-btn"
                              style={smallBtn}
                              onClick={() => setEditingId(null)}
                              disabled={isSaving}
                            >
                              CANCEL
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                            <button
                              className="cyber-btn"
                              style={{ ...smallBtn, borderColor: "var(--cyber-glow2)", color: "var(--cyber-glow2)" }}
                              onClick={() => startEdit(row)}
                              disabled={isDeleting}
                            >
                              EDIT
                            </button>
                            <button
                              className="cyber-btn danger"
                              style={smallBtn}
                              onClick={() => deleteRow(row.id)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? "..." : "DEL"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Footer: live totals per team for this round */}
              <tfoot>
                <tr style={{ borderTop: "2px solid var(--cyber-border)", background: "rgba(0,245,255,0.03)" }}>
                  <td colSpan={3} style={{ ...tdBase, paddingTop: 12 }}>
                    <span
                      style={{
                        fontFamily: "'Orbitron', monospace",
                        fontSize: 9,
                        color: "var(--cyber-dim)",
                        letterSpacing: 2,
                      }}
                    >
                      ROUND TOTALS
                    </span>
                  </td>
                  <td colSpan={2} style={{ ...tdBase, paddingTop: 12 }}>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      {currentRound &&
                        [...teams]
                          .sort(
                            (a, b) =>
                              getRoundScore(scores, b.id, currentRound.id) -
                              getRoundScore(scores, a.id, currentRound.id)
                          )
                          .map((t) => {
                            const rs = currentRound
                              ? getRoundScore(scores, t.id, currentRound.id)
                              : 0;
                            return (
                              <span
                                key={t.id}
                                style={{
                                  fontFamily: "'Share Tech Mono', monospace",
                                  fontSize: 11,
                                  color: rs > 0 ? "var(--cyber-text)" : "var(--cyber-dim)",
                                }}
                              >
                                <span style={{ color: "var(--cyber-dim)" }}>
                                  {t.name}:{" "}
                                </span>
                                <span
                                  style={{
                                    color: rs >= 0 ? "var(--cyber-green)" : "var(--cyber-red)",
                                    fontWeight: 700,
                                  }}
                                >
                                  {rs >= 0 ? "+" : ""}
                                  {rs}
                                </span>
                              </span>
                            );
                          })}
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
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

// ── Shared table cell styles ───────────────────────────────────────────────────
const tdBase = {
  padding: "10px 14px",
  verticalAlign: "middle",
  color: "var(--cyber-text)",
};

const smallBtn = {
  padding: "4px 10px",
  fontSize: 9,
  clipPath: "none",
};

const inlineInput = {
  background: "rgba(0,245,255,0.06)",
  border: "1px solid var(--cyber-glow)",
  color: "var(--cyber-glow)",
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 13,
  padding: "4px 8px",
  outline: "none",
  width: 60,
};