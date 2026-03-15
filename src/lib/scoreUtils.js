/**
 * scoreUtils.js — pure, side-effect-free helpers for score maths.
 * Import these wherever you need rankings/totals.
 */

/** Total score for a team across ALL rounds */
export function getTotalScore(scores, teamId) {
  return scores
    .filter((s) => s.team_id === teamId)
    .reduce((acc, s) => acc + (s.points ?? 0), 0);
}

/** Score for a team in a specific round */
export function getRoundScore(scores, teamId, roundId) {
  return scores
    .filter((s) => s.team_id === teamId && s.round_id === roundId)
    .reduce((acc, s) => acc + (s.points ?? 0), 0);
}

/** Sort teams by total score descending, return new array with rank attached */
export function rankByTotal(teams, scores) {
  return [...teams]
    .sort((a, b) => getTotalScore(scores, b.id) - getTotalScore(scores, a.id))
    .map((team, i) => ({ ...team, rank: i + 1, totalScore: getTotalScore(scores, team.id) }));
}

/** Sort teams by round score descending */
export function rankByRound(teams, scores, roundId) {
  return [...teams]
    .sort((a, b) => getRoundScore(scores, b.id, roundId) - getRoundScore(scores, a.id, roundId))
    .map((team, i) => ({
      ...team,
      rank: i + 1,
      roundScore: getRoundScore(scores, team.id, roundId),
    }));
}

/** Map action type → signed point delta, given a round config */
export function actionPoints(actionType, roundConfig) {
  const { bounce_plus = 10, pounce_plus = 20, pounce_minus = 5 } = roundConfig ?? {};
  const map = {
    bounce_plus:  bounce_plus,
    pounce_plus:  pounce_plus,
    pounce_minus: -pounce_minus,
    buzzer_plus:  bounce_plus,
    buzzer_minus: -pounce_minus,
  };
  return map[actionType] ?? 0;
}
