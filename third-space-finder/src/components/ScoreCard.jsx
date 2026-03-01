import { GRADE_COLORS } from "../constants";
import { appStyles as s } from "../styles/app";

// Displays the A–F grade badge in the header.
// scoreData shape: { grade, score, breakdown: { total, diversity, avgRating, missing[] } }

export function GradeBadge({ scoreData }) {
  if (!scoreData) return null;
  return (
    <div style={{ ...s.gradeBadge, background: GRADE_COLORS[scoreData.grade] }}>
      <span style={s.gradeLabel}>Social Score</span>
      <span style={s.gradeValue}>{scoreData.grade}</span>
      <span style={s.gradeNum}>{scoreData.score}/100</span>
    </div>
  );
}

// Displays the full breakdown card in the sidebar.
export function ScoreCard({ scoreData }) {
  if (!scoreData) return null;
  const { total, diversity, avgRating, missing } = scoreData.breakdown;

  return (
    <div style={s.scoreCard}>
      <h3 style={s.sidebarTitle}>Neighborhood Report</h3>
      <div style={s.scoreRow}><span>Total third places</span><strong>{total}</strong></div>
      <div style={s.scoreRow}><span>Type diversity</span><strong>{diversity}%</strong></div>
      <div style={s.scoreRow}><span>Avg rating</span><strong>⭐ {avgRating}</strong></div>
      {missing?.length > 0 && (
        <div style={s.missingBox}>
          <p style={s.missingTitle}>⚠️ What's missing</p>
          {missing.map((m) => (
            <span key={m} style={s.missingTag}>{m}</span>
          ))}
        </div>
      )}
    </div>
  );
}