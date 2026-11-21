// Shoreline themes and fonts: the presets, custom-theme colors, and the CSS variables
// (--sl-*) that _sass/capstone/shoreline.scss reads. Pure functions only, so they run
// under `node --test`; preferences-store.js puts the variables on <html>.

/** Shoreline's own look. Its values match the fallbacks in shoreline.scss. */
const SHORELINE_PALETTE = Object.freeze({
    page: '#ffffff', surface: '#ffffff', text: '#3c3c3c', ink: '#262b36', heading: '#1c244b',
    muted: '#6b7280', border: '#e3e8ea', accent: '#43c0d4', accentDeep: '#2ea6bd', mist: '#eef8fa',
});

export const DEFAULT_THEME = 'shoreline';
export const CUSTOM_THEME = 'custom';

export const THEMES = Object.freeze([
    { id: 'shoreline', label: 'Shoreline', palette: SHORELINE_PALETTE },
    { id: 'midnight', label: 'Midnight', palette: {
        page: '#0b1220', surface: '#131d31', text: '#d6deea', ink: '#e6eef8', heading: '#f2f6fb',
        muted: '#9aa8bb', border: '#24324b', accent: '#43c0d4', accentDeep: '#2b93a8', mist: '#0f192b' } },
    { id: 'charcoal', label: 'Charcoal', palette: {
        page: '#1b1d21', surface: '#24272c', text: '#d9dcdf', ink: '#e8eaec', heading: '#ffffff',
        muted: '#a0a6ad', border: '#353a41', accent: '#f2a43a', accentDeep: '#d98b22', mist: '#202328' } },
    { id: 'ocean', label: 'Ocean', palette: {
        page: '#f2f8fc', surface: '#ffffff', text: '#22384a', ink: '#1a2e3e', heading: '#0f3a5f',
        muted: '#5a7184', border: '#d3e3ee', accent: '#1f7fbf', accentDeep: '#17689e', mist: '#e3f0f8' } },
    { id: 'sand', label: 'Sand', palette: {
        page: '#fbf6ec', surface: '#fffdf8', text: '#4a4036', ink: '#3a3128', heading: '#5a3a1a',
        muted: '#7a6d5e', border: '#eadfcb', accent: '#c07a3a', accentDeep: '#a5622a', mist: '#f4ead8' } },
    { id: 'forest', label: 'Forest', palette: {
        page: '#f6faf3', surface: '#ffffff', text: '#34402e', ink: '#283322', heading: '#23401f',
        muted: '#66735f', border: '#dde8d5', accent: '#4f9a3a', accentDeep: '#3d7f2c', mist: '#e9f3e2' } },
]);

// `stack` is the CSS font-family; `google` is the Google Fonts family to load (if any).
export const FONTS = Object.freeze([
    { id: 'shoreline', label: 'Shoreline (Roboto and Asap)', stack: null, google: null },
    { id: 'atkinson', label: 'Atkinson Hyperlegible (easy to read)',
        stack: "'Atkinson Hyperlegible', Verdana, sans-serif", google: 'Atkinson+Hyperlegible:wght@400;700' },
    { id: 'lexend', label: 'Lexend (easy to read)',
        stack: "'Lexend', Verdana, sans-serif", google: 'Lexend:wght@400;600;700' },
    { id: 'serif', label: 'Serif (Georgia)', stack: "Georgia, 'Times New Roman', serif", google: null },
    { id: 'system', label: 'This device’s font', stack: "system-ui, -apple-system, 'Segoe UI', sans-serif", google: null },
]);

export const DEFAULT_CUSTOM_COLORS = Object.freeze({ page: '#ffffff', text: '#3c3c3c', accent: '#43c0d4' });
export const SAVED_THEME_LIMIT = 8;
const NAME_LIMIT = 40;

const VARIABLE_NAMES = Object.freeze({
    page: '--sl-page', surface: '--sl-surface', text: '--sl-text', ink: '--sl-ink', heading: '--sl-heading',
    muted: '--sl-muted', border: '--sl-border', accent: '--sl-accent', accentDeep: '--sl-accent-deep', mist: '--sl-mist',
});

const HEX = /^#[0-9a-f]{6}$/i;

export function isHexColor(value) {
    return typeof value === 'string' && HEX.test(value);
}

function toRgb(hex) {
    return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
}

/** Blend two #rrggbb colors; amount 0 gives `from`, 1 gives `to`. */
export function mixColors(from, to, amount) {
    const a = toRgb(from);
    const b = toRgb(to);
    return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * amount).toString(16).padStart(2, '0')).join('');
}

/** True for dark backgrounds (relative luminance below the midpoint). */
export function isDarkColor(hex) {
    const [r, g, b] = toRgb(hex).map(v => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.18;
}

/** Valid {page, text, accent}, keeping each good color and defaulting the rest. */
export function normalizeCustomColors(raw) {
    const input = raw && typeof raw === 'object' ? raw : {};
    const color = key => (isHexColor(input[key]) ? input[key].toLowerCase() : DEFAULT_CUSTOM_COLORS[key]);
    return { page: color('page'), text: color('text'), accent: color('accent') };
}

/** The full palette for three picked colors: the in-between shades are blends of them. */
export function customPalette(colors) {
    const { page, text, accent } = normalizeCustomColors(colors);
    const dark = isDarkColor(page);
    return {
        page,
        surface: mixColors(page, dark ? '#ffffff' : text, dark ? 0.06 : 0.02),
        text,
        ink: mixColors(text, dark ? '#ffffff' : '#000000', 0.2),
        heading: mixColors(text, accent, 0.25),
        muted: mixColors(text, page, 0.35),
        border: mixColors(page, text, 0.15),
        accent,
        accentDeep: mixColors(accent, '#000000', 0.15),
        mist: mixColors(page, accent, 0.08),
    };
}

/** Saved custom themes: named, de-duplicated by name, newest kept, at most SAVED_THEME_LIMIT. */
export function normalizeSavedThemes(raw) {
    if (!Array.isArray(raw)) return [];
    const seen = new Set();
    const themes = [];
    for (const item of raw) {
        const name = typeof item?.name === 'string' ? item.name.trim().slice(0, NAME_LIMIT) : '';
        if (!name || seen.has(name.toLowerCase())) continue;
        seen.add(name.toLowerCase());
        themes.push({ name, colors: normalizeCustomColors(item.colors), font: fontById(item.font).id });
        if (themes.length === SAVED_THEME_LIMIT) break;
    }
    return themes;
}

export function themeById(id) {
    return THEMES.find(theme => theme.id === id) || null;
}

export function fontById(id) {
    return FONTS.find(font => font.id === id) || FONTS[0];
}

/**
 * The --sl-* variables for these preferences. Values are null when Shoreline's own look
 * applies, so the caller removes them and the stylesheet fallbacks take over.
 * High contrast wins over any theme: it needs its own fixed black-on-white colors.
 */
export function themeVariables(prefs) {
    const palette = prefs.highContrast || prefs.theme === DEFAULT_THEME ? null
        : prefs.theme === CUSTOM_THEME ? customPalette(prefs.customColors)
        : themeById(prefs.theme)?.palette || null;
    const font = fontById(prefs.font);
    const variables = {};
    Object.entries(VARIABLE_NAMES).forEach(([key, name]) => { variables[name] = palette ? palette[key] : null; });
    variables['--sl-body-font'] = font.stack;
    variables['--sl-heading-font'] = font.stack;
    variables['color-scheme'] = palette && isDarkColor(palette.page) ? 'dark' : null;
    return variables;
}
