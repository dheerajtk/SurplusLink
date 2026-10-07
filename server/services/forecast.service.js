/**
 * Exponentially Weighted Moving Average (EWMA) forecast.
 *
 * Given a history of { soldQty, expectedAttendance } entries for the same
 * menu item + weekday, this predicts how many portions to prepare today.
 *
 * WHY EWMA: it adapts to recent trends without discarding older data.
 * A simple average treats 3-month-old data the same as yesterday.
 * With alpha=0.4, yesterday gets 40% weight, the day before 24%, etc.
 */

const ALPHA      = 0.4;  // recency sensitivity  (0 = ignore new data, 1 = only new data)
const BUFFER_PCT = 0.08; // 8 % safety buffer to avoid under-preparing

/**
 * @param {object[]} history        MealLog docs sorted oldest-first
 *                                  each: { soldQty, expectedAttendance, weekday }
 * @param {number}   todayAttendance expected headcount today
 * @param {number}   todayWeekday    0-6 (Sun-Sat)
 * @param {number}   [bufferPct]     override default buffer
 * @returns {number} recommended portions (integer, always >= 1)
 */
function forecast({ history, todayAttendance, todayWeekday, bufferPct = BUFFER_PCT }) {
  // ── Step 1: Filter to same weekday ─────────────────────────────────────────
  const sameDay = history.filter((h) => h.weekday === todayWeekday);
  const source  = sameDay.length >= 3 ? sameDay : history; // fall back to all days if <3 points

  if (source.length === 0) {
    // Absolute fallback: 1 portion per 10 expected attendees + buffer
    return Math.ceil((todayAttendance / 10) * (1 + bufferPct));
  }

  // ── Step 2: Compute EWMA of demand rate (soldQty per attendee) ─────────────
  let ewma = source[0].soldQty / Math.max(source[0].expectedAttendance, 1);
  for (let i = 1; i < source.length; i++) {
    const rate = source[i].soldQty / Math.max(source[i].expectedAttendance, 1);
    ewma = ALPHA * rate + (1 - ALPHA) * ewma;
  }

  // ── Step 3: Project to today's attendance + safety buffer ──────────────────
  const raw = ewma * todayAttendance;
  return Math.max(1, Math.ceil(raw * (1 + bufferPct)));
}

/**
 * forecastAccuracy — Mean Absolute Error % for analytics.
 * Used in the admin metrics endpoint.
 *
 * @param {object[]} logs  MealLog docs with forecastedQty and soldQty
 * @returns {number} MAE percentage (lower = better)
 */
function forecastAccuracy(logs) {
  const valid = logs.filter((l) => l.forecastedQty != null && l.soldQty != null);
  if (valid.length === 0) return null;
  const mae = valid.reduce((sum, l) => sum + Math.abs(l.forecastedQty - l.soldQty), 0) / valid.length;
  const avgSold = valid.reduce((sum, l) => sum + l.soldQty, 0) / valid.length;
  return avgSold > 0 ? Math.round((mae / avgSold) * 100) : null;
}

module.exports = { forecast, forecastAccuracy };
