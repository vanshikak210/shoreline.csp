// Saves Shoreline preferences on this device and applies them to the page.
//
// Kept separate from the site-wide OCS theme ('sitePreferences'): Shoreline pins its own
// palette, so it stores only its own keys here and never changes OCS pages.
// Language goes through window.SitePreferences.applyLanguage (assets/js/user-preferences.js,
// loaded by every layout), which drives Google Translate.

import { normalizePreferences, preferenceAttributes } from './preferences-model.js';

const STORAGE_KEY = 'shoreline.preferences';

/** Saved preferences, or the defaults when none are saved or storage is unavailable. */
export function loadPreferences() {
    try {
        return normalizePreferences(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'));
    } catch (err) {
        console.warn('Shoreline: could not read saved preferences, using defaults', err);
        return normalizePreferences(null);
    }
}

/** Save to this device. Returns the normalized preferences that were stored. */
export function savePreferences(preferences) {
    const prefs = normalizePreferences(preferences);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    return prefs;
}

/** Set or clear the <html> attributes the Shoreline styles read. */
export function applyLook(preferences, root = document.documentElement) {
    Object.entries(preferenceAttributes(preferences)).forEach(([name, value]) => {
        if (value === null) root.removeAttribute(name);
        else root.setAttribute(name, value);
    });
}

/**
 * Switch the page language. Skips the call when the page is already in that language,
 * because SitePreferences reloads Google Translate on every call.
 */
export function applyLanguage(language) {
    const api = window.SitePreferences;
    if (!api?.applyLanguage) {
        console.warn('Shoreline: SitePreferences is not loaded, so the language cannot change on this page');
        return;
    }
    const current = document.documentElement.getAttribute('data-translate-lang') || '';
    if (current !== language) api.applyLanguage(language);
}

/** Apply everything saved; runs on every Shoreline page from _includes/shoreline/header.html. */
export function applySavedPreferences() {
    const prefs = loadPreferences();
    applyLook(prefs);
    if (prefs.language) applyLanguage(prefs.language);
    return prefs;
}
