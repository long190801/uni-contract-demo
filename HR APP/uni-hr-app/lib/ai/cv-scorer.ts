export interface CVScoreResult {
  score: number
  x: number
  breakdown: string
}

// Formula: Score = (2*x) / (y²)
// z = required years for position
// nkn = candidate's actual years
// y = number of companies
export function computeCVScore(nkn: number, y: number, z: number): CVScoreResult {
  let x: number
  let breakdown: string

  if (nkn > z + 5) {
    x = 0
    breakdown = `${nkn} năm KN > ${z + 5} (z+5) → x = 0 (quá nhiều KN)`
  } else if (nkn < z) {
    x = nkn * 0.5
    breakdown = `${nkn} năm KN < ${z} (z) → x = ${nkn} × 0.5 = ${x}`
  } else {
    x = z + (nkn - z) * 0.5
    breakdown = `${z} ≤ ${nkn} ≤ ${z + 5} → x = ${z} + (${nkn}-${z}) × 0.5 = ${x}`
  }

  const score = y === 0 ? 0 : (2 * x) / (y * y)

  return {
    score: Math.round(score * 100) / 100,
    x,
    breakdown: `${breakdown} | y=${y} công ty | Điểm = (2×${x}) / ${y}² = ${Math.round(score * 100) / 100}`,
  }
}
