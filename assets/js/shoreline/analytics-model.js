// Shoreline admin analytics: turns the Flask GET /api/shoreline/admin/analytics payload
// (built by docs/shoreline-backend/shoreline_analytics.py) into rows the page can draw.
//
// Pure functions only, so they run under `node --test`. The payload comes over the
// network, so every reader tolerates missing or malformed fields.

const SURVEY_CHOICES = [
    { value: 'volunteer', label: 'Volunteer' },
    { value: 'donate', label: 'Donate' },
    { value: 'none', label: 'Just browsing' },
];

function toCount(value) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Round to at most two decimals so hour totals read cleanly (12.5, not 12.499999). */
export function roundHours(value) {
    return Math.round(toCount(value) * 100) / 100;
}

/**
 * Bar rows sorted largest first: [{label, value, percent}] where percent is the share of
 * the largest value (0–100), so the top bar fills its track.
 */
export function toBars(items, valueKey = 'count') {
    const rows = (Array.isArray(items) ? items : [])
        .map(item => ({ label: String(item?.label ?? '').trim(), value: toCount(item?.[valueKey]) }))
        .filter(row => row.label)
        .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
    const max = rows.reduce((m, row) => Math.max(m, row.value), 0);
    return rows.map(row => ({ ...row, percent: max ? Math.round((row.value / max) * 100) : 0 }));
}

/** Survey answers in a fixed order with each choice's share of all answers (0–100). */
export function surveyBreakdown(survey) {
    const counts = SURVEY_CHOICES.map(choice => ({ ...choice, value: toCount(survey?.[choice.value]) }));
    const total = counts.reduce((sum, row) => sum + row.value, 0);
    return {
        total,
        rows: counts.map(row => ({
            label: row.label,
            value: row.value,
            percent: total ? Math.round((row.value / total) * 100) : 0,
        })),
    };
}

/** Sign-ups per month, oldest first, as bar rows labelled like "Nov 2026". */
export function signupsByMonth(signups) {
    const months = (Array.isArray(signups?.by_month) ? signups.by_month : [])
        .filter(m => /^\d{4}-\d{2}$/.test(String(m?.month)))
        .sort((a, b) => a.month.localeCompare(b.month));
    const max = months.reduce((m, row) => Math.max(m, toCount(row.count)), 0);
    return months.map(row => {
        const [year, month] = row.month.split('-').map(Number);
        const label = new Date(Date.UTC(year, month - 1, 1))
            .toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
        const value = toCount(row.count);
        return { label, value, percent: max ? Math.round((value / max) * 100) : 0 };
    });
}

/** Headline numbers for the stat tiles. */
export function headlineStats(payload) {
    return {
        members: toCount(payload?.members),
        totalHours: roundHours(payload?.hours?.total),
        shifts: toCount(payload?.hours?.shifts),
        volunteers: toCount(payload?.hours?.volunteers),
    };
}
