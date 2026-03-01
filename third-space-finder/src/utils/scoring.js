import { PLACE_CATEGORIES } from "../constants";

// ─────────────────────────────────────────────────────────────
// computeScore: takes an array of Google Places results and
// returns a letter grade + numeric score + breakdown object.
//
// THIS IS YOUR INTELLECTUAL CONTRIBUTION — tweak these weights
// to reflect real urban planning research. For example:
//   - Jane Jacobs argued diversity > density
//   - "20-minute city" research weights walkability heavily
//   - You could pull Census population data to normalize total
// ─────────────────────────────────────────────────────────────

export function computeScore(places) {
  if (!places.length) return { grade: "F", score: 0, breakdown: {} };

  const total = places.length;
  const typeSet = new Set(places.map((p) => p.category));

  // How many of the possible categories are represented? (0–1)
  const diversity = typeSet.size / PLACE_CATEGORIES.length;

  // Average Google rating across all places (1–5 scale)
  const avgRating = places.reduce((s, p) => s + (p.rating || 3.5), 0) / total;

  // How dense? Caps out at 20 places = 100%
  const densityScore = Math.min(total / 20, 1);

  // Weighted formula — change these numbers to shift priorities
  const raw =
    densityScore * 40 +          // 40% weight → quantity of places
    diversity * 35 +              // 35% weight → variety of types
    ((avgRating - 1) / 4) * 25;  // 25% weight → quality (ratings)

  const score = Math.round(raw);

  const grade =
    score >= 85 ? "A" :
    score >= 70 ? "B" :
    score >= 55 ? "C" :
    score >= 40 ? "D" : "F";

  // Which categories are completely absent?
  const missing = PLACE_CATEGORIES
    .filter((c) => !typeSet.has(c.type))
    .map((c) => c.label);

  return {
    grade,
    score,
    breakdown: {
      total,
      diversity: Math.round(diversity * 100),
      avgRating: avgRating.toFixed(1),
      missing,
    },
  };
}