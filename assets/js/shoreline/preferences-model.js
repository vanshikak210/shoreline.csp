// Shoreline preferences: language and how the site looks.
//
// Pure functions only, so they run under `node --test`. preferences-store.js does the
// storage and DOM work. Saved values are untrusted (anyone can edit localStorage),
// so normalizePreferences keeps only known values and falls back to the defaults.

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
    { value: 'ru', label: 'Russian' },
    { value: 'uk', label: 'Ukrainian' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'pt', label: 'Portuguese' },
]);

export const DEFAULT_PREFERENCES = Object.freeze({
    language: '',
    textSize: 'normal',
    highContrast: false,
    reduceMotion: false,
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
