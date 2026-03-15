/** A single row in any leaderboard / ranking list. */
export default function RankRow({ rank, name, score }) {
  const medal =
    rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;
  const rankClass =
    rank === 1 ? "rank-1" : rank === 2 ? "rank-2" : rank === 3 ? "rank-3" : "";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 0",
        borderBottom: "1px solid var(--cyber-border)",
      }}
    >
      <span
        className={rankClass}
        style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: 12,
          width: 28,
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        {medal}
      </span>
      <span
        style={{
          flex: 1,
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 15,
          color: "var(--cyber-text)",
        }}
      >
        {name}
      </span>
      <span
        className={rankClass}
        style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: 13,
          color: rank === 1 ? undefined : "var(--cyber-glow)",
        }}
      >
        {score}
      </span>
    </div>
  );
}
