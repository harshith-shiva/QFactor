/**
 * CrosswordFooter — decorative crossword puzzle footer for the Landing Page.
 *
 * Words hidden in the grid:
 *   1 Across — RAJEEV   (best frontend developer)
 *   1 Down   — HARSHITH (all the backend work)
 *   2 Across — DINESH   (quiz master)
 *   3 Across — AMCS     (department)
 *   4 Down   — TECH     (kind of team)
 *   5 Down   — CSA      (organiser)
 */
export default function CrosswordFooter() {
  const ROWS = 10;
  const COLS = 13;

  // [word, startRow, startCol, direction]
  const wordDefs = [
    { word: "RAJEEV",   row: 1, col: 0, dir: "across" },
    { word: "HARSHITH", row: 0, col: 3, dir: "down"   },
    { word: "DINESH",   row: 4, col: 1, dir: "across" },
    { word: "AMCS",     row: 7, col: 5, dir: "across" },
    { word: "TECH",     row: 0, col: 0, dir: "down"   },
    { word: "CSA",      row: 5, col: 9, dir: "down"   },
  ];

  // Build letter grid
  const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  wordDefs.forEach(({ word, row, col, dir }) => {
    for (let i = 0; i < word.length; i++) {
      const r = dir === "down"   ? row + i : row;
      const c = dir === "across" ? col + i : col;
      if (r < ROWS && c < COLS) grid[r][c] = word[i];
    }
  });

  // Clue-number positions
  const clueNums = {
    "1-0": 1,  // RAJEEV across + TECH down share start
    "0-3": 1,  // HARSHITH down  (re-uses "1" since puzzle numbering is by start cell)
    "4-1": 2,  // DINESH across
    "7-5": 3,  // AMCS across
    "5-9": 5,  // CSA down
  };

  const clues = {
    across: [
      "1. Who is the best frontend developer? (6)",
      "2. Who conducts the quiz? (6)",
      "3. Department acronym? (4)",
    ],
    down: [
      "1. Who did all the backend work? (8)",
      "4. What kind of team built this? (4)",
      "5. Who organised the event? (3)",
    ],
  };

  return (
    <footer
      style={{
        background: "#08050f",
        borderTop: "1px solid rgba(180,60,255,0.2)",
        padding: "48px 32px 32px",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Credits heading */}
        <div style={{ textAlign: "center", marginBottom: 6 }}>
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 13,
              letterSpacing: 4,
              color: "#604080",
              textTransform: "uppercase",
            }}
          >
            Built by CSA Tech Team
          </span>
        </div>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 22,
              color: "#c090e0",
              fontStyle: "italic",
            }}
          >
            Meet the Team — Crossword Edition
          </span>
        </div>

        {/* Grid + Clues */}
        <div
          style={{
            display: "flex",
            gap: 40,
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          {/* Grid */}
          <table className="crossword-grid" style={{ borderCollapse: "collapse" }}>
            <tbody>
              {grid.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => {
                    const num = clueNums[`${ri}-${ci}`];
                    return (
                      <td key={ci} className={cell ? "filled" : "black"}>
                        {num && <span className="clue-num">{num}</span>}
                        {cell ?? ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Clues */}
          <div style={{ minWidth: 220 }}>
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: 10,
                  color: "#c090e0",
                  letterSpacing: 2,
                  marginBottom: 8,
                  textTransform: "uppercase",
                }}
              >
                Across
              </div>
              {clues.across.map((c, i) => (
                <div
                  key={i}
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 14,
                    color: "#9070b0",
                    marginBottom: 6,
                    lineHeight: 1.4,
                  }}
                >
                  {c}
                </div>
              ))}
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: 10,
                  color: "#c090e0",
                  letterSpacing: 2,
                  marginBottom: 8,
                  textTransform: "uppercase",
                }}
              >
                Down
              </div>
              {clues.down.map((c, i) => (
                <div
                  key={i}
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 14,
                    color: "#9070b0",
                    marginBottom: 6,
                    lineHeight: 1.4,
                  }}
                >
                  {c}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom line */}
        <div
          style={{
            textAlign: "center",
            marginTop: 32,
            paddingTop: 20,
            borderTop: "1px solid rgba(100,50,150,0.2)",
          }}
        >
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "#604080",
              fontSize: 13,
              letterSpacing: 2,
            }}
          >
            © 2026 CSA Tech Team · PSG College of Technology · Women's Day Celebration
          </span>
        </div>
      </div>
    </footer>
  );
}
