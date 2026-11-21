// Shoreline account types, preferences and admin analytics (pure models).
// Run: node --test tests/shoreline_account.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

import { isShorelineAdmin, accountType, accountTabs } from '../assets/js/shoreline/account-model.js';
import { normalizePreferences, preferenceAttributes, DEFAULT_PREFERENCES, translateCookieDomains } from '../assets/js/shoreline/preferences-model.js';
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
    const prefs = {
        language: 'es', textSize: 'xlarge', highContrast: true, reduceMotion: true,
        theme: 'custom', customColors: { page: '#101820', text: '#f0f0f0', accent: '#fcb900' }, font: 'atkinson',
        savedThemes: [{ name: 'Night', colors: { page: '#101820', text: '#f0f0f0', accent: '#fcb900' }, font: 'atkinson' }],
        readAloud: { enabled: true, voice: 'Samantha', rate: 1.2, pitch: 0.9 },
    };
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

test('translate cookies are cleared on the host and every parent domain', () => {
    assert.deepEqual(translateCookieDomains('shoreline.opencodingsociety.com'),
        ['shoreline.opencodingsociety.com', 'opencodingsociety.com']);
    assert.deepEqual(translateCookieDomains('localhost'), []);
    assert.deepEqual(translateCookieDomains('127.0.0.1'), []);
    assert.deepEqual(translateCookieDomains(''), []);
});

// ── Themes, fonts and read-aloud (theme-model.js, read-aloud-model.js) ──
import { THEMES, themeVariables, customPalette, normalizeSavedThemes, mixColors, isDarkColor, SAVED_THEME_LIMIT } from '../assets/js/shoreline/theme-model.js';
import { speechChunks, pickVoice } from '../assets/js/shoreline/read-aloud-model.js';

test('Shoreline theme and font leave every variable to the stylesheet', () => {
    const variables = themeVariables(normalizePreferences(null));
    assert.ok(Object.values(variables).every(value => value === null));
});

test('a preset theme sets its palette, and dark presets ask for dark form controls', () => {
    const variables = themeVariables(normalizePreferences({ theme: 'midnight' }));
    const midnight = THEMES.find(theme => theme.id === 'midnight').palette;
    assert.equal(variables['--sl-page'], midnight.page);
    assert.equal(variables['--sl-accent'], midnight.accent);
    assert.equal(variables['color-scheme'], 'dark');
    assert.equal(themeVariables(normalizePreferences({ theme: 'sand' }))['color-scheme'], null);
});

test('high contrast overrides the theme colors but keeps the chosen font', () => {
    const variables = themeVariables(normalizePreferences({ theme: 'midnight', highContrast: true, font: 'atkinson' }));
    assert.equal(variables['--sl-page'], null);
    assert.match(variables['--sl-body-font'], /Atkinson/);
});

test('custom themes build a full palette from three picked colors', () => {
    const palette = customPalette({ page: '#000000', text: '#ffffff', accent: '#ff0000' });
    assert.equal(palette.page, '#000000');
    assert.equal(palette.accent, '#ff0000');
    assert.ok(isDarkColor(palette.page));
    assert.ok(Object.values(palette).every(value => /^#[0-9a-f]{6}$/.test(value)));
    assert.equal(themeVariables(normalizePreferences({ theme: 'custom', customColors: palette }))['--sl-page'], '#000000');
});

test('bad saved colors, themes and fonts fall back to Shoreline defaults', () => {
    const prefs = normalizePreferences({ theme: 'neon', font: 'comic', customColors: { page: 'red', text: '#12345' } });
    assert.equal(prefs.theme, 'shoreline');
    assert.equal(prefs.font, 'shoreline');
    assert.deepEqual(prefs.customColors, DEFAULT_PREFERENCES.customColors);
});

test('saved themes need a name, drop duplicate names and stop at the limit', () => {
    const many = Array.from({ length: 12 }, (_, i) => ({ name: `Theme ${i}`, colors: {}, font: 'serif' }));
    assert.equal(normalizeSavedThemes(many).length, SAVED_THEME_LIMIT);
    const cleaned = normalizeSavedThemes([{ name: ' Calm ' }, { name: 'calm' }, { name: '' }, null, 'x']);
    assert.deepEqual(cleaned.map(theme => theme.name), ['Calm']);
    assert.equal(cleaned[0].font, 'shoreline');
});

test('mixing colors blends each channel', () => {
    assert.equal(mixColors('#000000', '#ffffff', 0.5), '#808080');
    assert.equal(mixColors('#123456', '#abcdef', 0), '#123456');
});

test('read-aloud settings are clamped to usable speeds', () => {
    const prefs = normalizePreferences({ readAloud: { enabled: true, rate: 9, pitch: 'loud', voice: 42 } });
    assert.deepEqual(prefs.readAloud, { enabled: true, voice: '', rate: 2, pitch: 1 });
});

test('speech is split at sentence ends into short chunks', () => {
    const text = 'First sentence here. Second one! ' + 'word '.repeat(80);
    const chunks = speechChunks(text, 60);
    assert.ok(chunks.length > 2);
    assert.ok(chunks.every(chunk => chunk.length <= 60));
    assert.equal(chunks[0], 'First sentence here. Second one!');
    assert.deepEqual(speechChunks('   '), []);
});

test('a saved voice is used only when this device has it', () => {
    const voices = [{ name: 'Samantha' }, { name: 'Daniel' }];
    assert.equal(pickVoice(voices, 'Daniel').name, 'Daniel');
    assert.equal(pickVoice(voices, 'Missing'), null);
    assert.equal(pickVoice(voices, ''), null);
});
