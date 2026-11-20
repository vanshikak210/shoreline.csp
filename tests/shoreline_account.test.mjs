// Shoreline account types, preferences and admin analytics (pure models).
// Run: node --test tests/shoreline_account.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

import { isShorelineAdmin, accountType, accountTabs } from '../assets/js/shoreline/account-model.js';
import { normalizePreferences, preferenceAttributes, DEFAULT_PREFERENCES } from '../assets/js/shoreline/preferences-model.js';
import { toBars, surveyBreakdown, signupsByMonth, headlineStats, roundHours } from '../assets/js/shoreline/analytics-model.js';

const tabIds = user => accountTabs(user).map(tab => tab.id);

test('a Flask user with role Admin is an admin account, any casing', () => {
    assert.equal(isShorelineAdmin({ role: 'Admin' }), true);
    assert.equal(isShorelineAdmin({ role: ' admin ' }), true);
    assert.equal(accountType({ role: 'Admin' }), 'admin');
});

test('users without the Admin role are regular accounts', () => {
    for (const user of [{ role: 'User' }, { role: 'Teacher' }, {}, null, undefined]) {
        assert.equal(isShorelineAdmin(user), false);
        assert.equal(accountType(user), 'user');
    }
});

test('regular users get Profile and Preferences tabs', () => {
    assert.deepEqual(tabIds({ role: 'User' }), ['profile', 'preferences']);
});

test('admins also get the Analytics tab, last', () => {
    assert.deepEqual(tabIds({ role: 'Admin' }), ['profile', 'preferences', 'analytics']);
    assert.equal(accountTabs({ role: 'Admin' })[2].path, '/shoreline/analytics');
});

test('tabs never expose the adminOnly flag to the page', () => {
    assert.ok(accountTabs({ role: 'Admin' }).every(tab => !('adminOnly' in tab)));
});

test('missing or tampered saved preferences fall back to defaults', () => {
    assert.deepEqual(normalizePreferences(null), DEFAULT_PREFERENCES);
    assert.deepEqual(normalizePreferences('junk'), DEFAULT_PREFERENCES);
    assert.deepEqual(
        normalizePreferences({ language: '<script>', textSize: 'huge', highContrast: 'yes', reduceMotion: 1 }),
        DEFAULT_PREFERENCES,
    );
});

test('valid preferences are kept', () => {
    const prefs = { language: 'es', textSize: 'xlarge', highContrast: true, reduceMotion: true };
    assert.deepEqual(normalizePreferences({ ...prefs, extra: 'dropped' }), prefs);
});

test('default look sets no page attributes; chosen looks set one each', () => {
    assert.deepEqual(preferenceAttributes(DEFAULT_PREFERENCES), {
        'data-sl-text-size': null, 'data-sl-contrast': null, 'data-sl-motion': null,
    });
    assert.deepEqual(preferenceAttributes({ textSize: 'large', highContrast: true, reduceMotion: true }), {
        'data-sl-text-size': 'large', 'data-sl-contrast': 'high', 'data-sl-motion': 'reduce',
    });
});

test('bars sort largest first and scale to the largest value', () => {
    const bars = toBars([{ label: 'La Jolla', count: 2 }, { label: 'Pacific Beach', count: 4 }, { label: '', count: 9 }]);
    assert.deepEqual(bars, [
        { label: 'Pacific Beach', value: 4, percent: 100 },
        { label: 'La Jolla', value: 2, percent: 50 },
    ]);
});

test('bars tolerate a malformed payload', () => {
    assert.deepEqual(toBars(undefined), []);
    assert.deepEqual(toBars([{ label: 'Event', hours: 'NaN' }], 'hours'), [{ label: 'Event', value: 0, percent: 0 }]);
});

test('survey breakdown keeps a fixed order and shares of all answers', () => {
    assert.deepEqual(surveyBreakdown({ donate: 1, volunteer: 3, none: 0 }), {
        total: 4,
        rows: [
            { label: 'Volunteer', value: 3, percent: 75 },
            { label: 'Donate', value: 1, percent: 25 },
            { label: 'Just browsing', value: 0, percent: 0 },
        ],
    });
    assert.equal(surveyBreakdown(null).total, 0);
});

test('sign-ups by month run oldest first with readable labels', () => {
    const rows = signupsByMonth({ by_month: [{ month: '2026-11', count: 4 }, { month: '2026-10', count: 2 }, { month: 'bad', count: 7 }] });
    assert.deepEqual(rows, [
        { label: 'Oct 2026', value: 2, percent: 50 },
        { label: 'Nov 2026', value: 4, percent: 100 },
    ]);
});

test('headline stats read the payload and round hours', () => {
    assert.deepEqual(headlineStats({ members: 5, hours: { total: 12.499999, shifts: 6, volunteers: 3 } }),
        { members: 5, totalHours: 12.5, shifts: 6, volunteers: 3 });
    assert.deepEqual(headlineStats({}), { members: 0, totalHours: 0, shifts: 0, volunteers: 0 });
    assert.equal(roundHours(-3), 0);
});
