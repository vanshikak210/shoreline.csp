---
---
// Shoreline admin analytics page (/shoreline/analytics).
// Reads GET /api/shoreline/admin/analytics, which Flask allows only for role "Admin";
// hiding the page from other users here is a convenience, not the access check.

import { apiURI, getShorelineUser, withSlowNotice } from '{{ site.baseurl }}/assets/js/shoreline/auth.js';
import { isShorelineAdmin } from '{{ site.baseurl }}/assets/js/shoreline/account-model.js';
import { toBars, surveyBreakdown, signupsByMonth, headlineStats, roundHours } from '{{ site.baseurl }}/assets/js/shoreline/analytics-model.js';

const $ = id => document.getElementById(id);

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

async function fetchAnalytics() {
    // A plain GET (no JSON headers) avoids a CORS preflight, as in profile.js.
    const res = await fetch(`${apiURI}/api/shoreline/admin/analytics`, { mode: 'cors', credentials: 'include', cache: 'no-store' });
    const raw = await res.text();
    let data = {};
    try { data = raw ? JSON.parse(raw) : {}; } catch (_) { data = { message: raw }; }
    if (!res.ok) {
        const err = new Error(data.message || `Request failed (${res.status})`);
        err.status = res.status;
        throw err;
    }
    return data;
}

/** Draw bar rows; `format` turns a value into its label text. */
function renderBars(el, rows, emptyText, format = value => value) {
    el.innerHTML = rows.length
        ? rows.map(row => `
            <div class="sl-bars__row">
                <span class="sl-bars__label">${escapeHtml(row.label)}</span>
                <span class="sl-bars__track"><span class="sl-bars__fill" style="width: ${row.percent}%"></span></span>
                <span class="sl-bars__value">${escapeHtml(format(row.value, row))}</span>
            </div>`).join('')
        : `<p class="sl-note">${emptyText}</p>`;
}

function renderTopVolunteers(volunteers) {
    const rows = Array.isArray(volunteers) ? volunteers : [];
    $('topVolunteerRows').innerHTML = rows.length
        ? rows.map(v => `<tr><td>${escapeHtml(v.name || v.uid || '')}</td><td>${roundHours(v.hours)}</td><td>${Number(v.shifts) || 0}</td></tr>`).join('')
        : '<tr><td colspan="3">No hours logged yet.</td></tr>';
}

function render(payload) {
    const stats = headlineStats(payload);
    $('statMembers').textContent = stats.members;
    $('statTotalHours').textContent = stats.totalHours;
    $('statShifts').textContent = stats.shifts;
    $('statVolunteers').textContent = stats.volunteers;

    renderBars($('signupBars'), signupsByMonth(payload.signups), 'No sign-ups recorded yet.');
    const since = payload.signups?.tracked_since;
    $('signupNote').textContent = since
        ? `Sign-up dates are recorded since ${new Date(since).toLocaleDateString()}; earlier members count in the total only.`
        : 'Sign-up dates are recorded for new Shoreline sign-ups.';

    const survey = surveyBreakdown(payload.survey);
    renderBars($('surveyBars'), survey.rows, 'No survey answers yet.', (value, row) => `${value} (${row.percent}%)`);
    $('surveyNote').textContent = `${survey.total} ${survey.total === 1 ? 'person has' : 'people have'} answered.`;

    renderBars($('activityBars'), toBars(payload.hours?.by_activity, 'hours'), 'No hours logged yet.', value => `${roundHours(value)} h`);
    renderTopVolunteers(payload.hours?.top_volunteers);
    renderBars($('neighborhoodBars'), toBars(payload.neighborhoods), 'No neighborhoods on profiles yet.');
    renderBars($('interestBars'), toBars(payload.interests), 'No interests on profiles yet.');
}

function explainFailure(err) {
    if (err instanceof TypeError) return 'Couldn\'t reach the Shoreline server. It may be waking up; refresh in a minute.';
    if (err.status === 404) return 'This server doesn\'t have Shoreline analytics yet (add the admin analytics route from docs/shoreline-backend).';
    if (err.status === 401 || err.status === 403) return 'The server says this account isn\'t an admin. Ask a Shoreline admin to check your role.';
    return `Couldn't load analytics: ${err.message}`;
}

export async function initAnalyticsPage() {
    const user = await getShorelineUser();
    if (!user) {
        $('analyticsSignedOut').hidden = false;
        return;
    }
    if (!isShorelineAdmin(user)) {
        $('analyticsNotAdmin').hidden = false;
        return;
    }

    $('analyticsStatus').textContent = 'Loading analytics…';
    try {
        const payload = await withSlowNotice(fetchAnalytics(), () => {
            $('analyticsStatus').textContent = 'Waking up the Shoreline server, this can take up to a minute…';
        });
        render(payload);
        $('analyticsApp').hidden = false;
        $('analyticsStatus').textContent = '';
    } catch (err) {
        console.warn('Shoreline: analytics request failed', err);
        $('analyticsStatus').textContent = explainFailure(err);
    }
}
