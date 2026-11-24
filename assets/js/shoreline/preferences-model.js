// Shoreline preferences: language and how the site looks.
//
// Pure functions only, so they run under `node --test`. preferences-store.js does the
// storage and DOM work. Saved values are untrusted (anyone can edit localStorage),
// so normalizePreferences keeps only known values and falls back to the defaults.

import {
    DEFAULT_THEME, CUSTOM_THEME, DEFAULT_CUSTOM_COLORS, themeById, fontById,
    normalizeCustomColors, normalizeSavedThemes,
} from './theme-model.js';

export const TEXT_SIZES = Object.freeze([
    { value: 'normal', label: 'Normal' },
    { value: 'large', label: 'Large' },
    { value: 'xlarge', label: 'Extra large' },
]);

// The languages Google Translate offers through the site-wide SitePreferences engine
// (assets/js/user-preferences.js); '' means the original English page.
export const LANGUAGES = Object.freeze([
    { value: '', label: 'English (original)' },
    { value: 'es', label: 'Spanish' },
    { value: 'zh-CN', label: 'Chinese (Simplified)' },
    { value: 'zh-TW', label: 'Chinese (Traditional)' },
    { value: 'vi', label: 'Vietnamese' },
    { value: 'ko', label: 'Korean' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ar', label: 'Arabic' },
    { value: 'fa', label: 'Persian (Farsi)' },
    { value: 'hi', label: 'Hindi' },
    { value: 'te', label: 'Telugu' },
    { value: 'ru', label: 'Russian' },
    { value: 'uk', label: 'Ukrainian' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'pt', label: 'Portuguese' },
]);

// Read-aloud speed and pitch limits (the Web Speech API accepts wider ranges,
// but outside these speech is hard to follow).
export const SPEECH_RATE = Object.freeze({ min: 0.5, max: 2, step: 0.1 });
export const SPEECH_PITCH = Object.freeze({ min: 0.5, max: 1.5, step: 0.1 });

// `enabled` is the floating Read aloud button (opt-in); `listenButtons` are the speaker
// buttons beside headings, on by default so people who need them never have to find a setting.
export const DEFAULT_READ_ALOUD = Object.freeze({ enabled: false, listenButtons: true, voice: '', rate: 1, pitch: 1 });

export const DEFAULT_PREFERENCES = Object.freeze({
    language: '',
    textSize: 'normal',
    highContrast: false,
    reduceMotion: false,
    theme: DEFAULT_THEME,
    customColors: DEFAULT_CUSTOM_COLORS,
    font: 'shoreline',
    savedThemes: Object.freeze([]),
    readAloud: DEFAULT_READ_ALOUD,
});

const LANGUAGE_VALUES = new Set(LANGUAGES.map(l => l.value));
const TEXT_SIZE_VALUES = new Set(TEXT_SIZES.map(s => s.value));

/** A complete, valid preferences object from any saved or submitted input. */
export function normalizePreferences(raw) {
    const input = raw && typeof raw === 'object' ? raw : {};
    return {
        language: LANGUAGE_VALUES.has(input.language) ? input.language : DEFAULT_PREFERENCES.language,
        textSize: TEXT_SIZE_VALUES.has(input.textSize) ? input.textSize : DEFAULT_PREFERENCES.textSize,
        highContrast: input.highContrast === true,
        reduceMotion: input.reduceMotion === true,
        theme: input.theme === CUSTOM_THEME || themeById(input.theme) ? input.theme : DEFAULT_THEME,
        customColors: normalizeCustomColors(input.customColors),
        font: fontById(input.font).id,
        savedThemes: normalizeSavedThemes(input.savedThemes),
        readAloud: normalizeReadAloud(input.readAloud),
    };
}

function clampNumber(value, { min, max }, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.round(Math.min(max, Math.max(min, number)) * 10) / 10;
}

/** Read-aloud settings: on/off, a voice name ('' = the browser's default) and speed/pitch. */
export function normalizeReadAloud(raw) {
    const input = raw && typeof raw === 'object' ? raw : {};
    return {
        enabled: input.enabled === true,
        listenButtons: input.listenButtons !== false,
        voice: typeof input.voice === 'string' ? input.voice.slice(0, 200) : '',
        rate: clampNumber(input.rate, SPEECH_RATE, DEFAULT_READ_ALOUD.rate),
        pitch: clampNumber(input.pitch, SPEECH_PITCH, DEFAULT_READ_ALOUD.pitch),
    };
}

/**
 * The <html> data attributes that switch the Shoreline look (see _sass/capstone/shoreline.scss).
 * Defaults map to null so the attribute is removed and the page keeps its normal styles.
 */
export function preferenceAttributes(preferences) {
    const prefs = normalizePreferences(preferences);
    return {
        'data-sl-text-size': prefs.textSize === 'normal' ? null : prefs.textSize,
        'data-sl-contrast': prefs.highContrast ? 'high' : null,
        'data-sl-motion': prefs.reduceMotion ? 'reduce' : null,
    };
}

/**
 * Every domain a Google Translate 'googtrans' cookie may sit on for this host: the host
 * itself and each parent domain. OCS sites on other subdomains (pages.opencodingsociety.com)
 * can leave one on '.opencodingsociety.com', which would otherwise override Shoreline's choice.
 * Returns [] for hosts without dots (localhost), where only the host-only cookie exists.
 */
export function translateCookieDomains(hostname) {
    const parts = String(hostname || '').split('.').filter(Boolean);
    if (parts.length < 2 || parts.every(part => /^\d+$/.test(part))) return [];
    const domains = [];
    for (let i = 0; i < parts.length - 1; i++) domains.push(parts.slice(i).join('.'));
    return domains;
}
