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
import { useState } from 'react';

export default function CrosswordFooter() {
  const [hoveredWordIndex, setHoveredWordIndex] = useState(-1);
  const ROWS = 9;
  const COLS = 12;

  // [word, startRow, startCol, direction] - reordered per correct clue mappings
  const wordDefs = [
    { word: "HARSHITH", row: 1, col: 3, dir: "down"   }, // across 0: best frontend
    { word: "DINESH",   row: 0, col: 8, dir: "down" }, // across 1: quiz
    { word: "AMCS",     row: 2, col: 3, dir: "across" }, // across 2: dept
    { word: "RAJEEV",   row: 3, col: 5, dir: "across" }, // down 0: backend
    { word: "TECH",     row: 1, col: 0, dir: "across"   }, // down 1: team
    { word: "CSA",      row: 1, col: 6, dir: "down"   }, // down 2: organiser
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
    "1-3": 1,  // RAJEEV across + TECH down share start
    "0-8": 2,  // HARSHITH down  (re-uses "1" since puzzle numbering is by start cell)
    "2-3": 3,  // DINESH across
    "3-5": 4,  // AMCS across
    "1-0": 5,
    "1-6": 6,  // CSA down
  };

  const clues = {
    across: [
      "1. Who is the best frontend developer? (8)",
      "2. Who conducts the quiz? (6)",
      "3. Department acronym? (4)",
    ],
    down: [
      "4. Who did all the backend work? (6)",
      "5. What kind of team built this? (4)",
      "6. Who organised the event? (3)",
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
                    const hoveredWord = hoveredWordIndex >= 0 ? wordDefs[hoveredWordIndex] : null;
                    const isHighlighted = hoveredWord && (() => {
                      const wordRow = hoveredWord.row;
                      const wordCol = hoveredWord.col;
                      const wordLen = hoveredWord.word.length;
                      const dir = hoveredWord.dir;
                      if (dir === 'across') {
                        return ri === wordRow && ci >= wordCol && ci < wordCol + wordLen;
                      } else {
                        return ci === wordCol && ri >= wordRow && ri < wordRow + wordLen;
                      }
                    })();
                    return (
                      <td 
                        key={ci} 
                        className={`${cell ? "filled" : "black"} ${isHighlighted ? "highlighted" : ""}`}
                      >
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
                  data-word-index={i}
                  onMouseEnter={() => setHoveredWordIndex(i)}
                  onMouseLeave={() => setHoveredWordIndex(-1)}
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 14,
                    color: "#9070b0",
                    marginBottom: 6,
                    lineHeight: 1.4,
                    cursor: "pointer",
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
                  data-word-index={3 + i}
                  onMouseEnter={() => setHoveredWordIndex(3 + i)}
                  onMouseLeave={() => setHoveredWordIndex(-1)}
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 14,
                    color: "#9070b0",
                    marginBottom: 6,
                    lineHeight: 1.4,
                    cursor: "pointer",
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