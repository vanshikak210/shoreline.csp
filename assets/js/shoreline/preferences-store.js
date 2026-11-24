// Saves Shoreline preferences on this device and applies them to the page.
//
// Kept separate from the site-wide OCS theme ('sitePreferences'): Shoreline themes only
// change Shoreline pages, so it stores only its own keys here and never changes OCS pages.
// Language goes through window.SitePreferences.applyLanguage (assets/js/user-preferences.js,
// loaded by every layout), which drives Google Translate.

import { normalizePreferences, preferenceAttributes, translateCookieDomains } from './preferences-model.js';
import { themeVariables, fontById } from './theme-model.js';
import { mountReadAloud } from './read-aloud.js';

const STORAGE_KEY = 'shoreline.preferences';
// The theme's CSS variables, cached so the inline script in _includes/shoreline/header.html
// can set them before the page paints (modules run too late to avoid a flash of white).
const THEME_CACHE_KEY = 'shoreline.themeVariables';
// Set while this device has changes the account hasn't received yet (preferences-account.js),
// so the next sync uploads them instead of replacing them with the account's older copy.
const UNSYNCED_KEY = 'shoreline.preferencesUnsynced';

export function markUnsynced(unsynced) {
    try {
        if (unsynced) localStorage.setItem(UNSYNCED_KEY, 'true');
        else localStorage.removeItem(UNSYNCED_KEY);
    } catch (err) {
        console.warn('Shoreline: could not record preference sync state', err);
    }
}

export function hasUnsyncedChanges() {
    try { return localStorage.getItem(UNSYNCED_KEY) === 'true'; } catch (_) { return false; }
}

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
    localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(themeVariables(prefs)));
    return prefs;
}

/** Load a Google Fonts family once per page. */
function loadFont(fontId) {
    const { id, google } = fontById(fontId);
    if (!google || document.getElementById(`sl-font-${id}`)) return;
    const link = document.createElement('link');
    link.id = `sl-font-${id}`;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${google}&display=swap`;
    document.head.appendChild(link);
}

/** Set or clear the <html> attributes and theme variables the Shoreline styles read. */
export function applyLook(preferences, root = document.documentElement) {
    const prefs = normalizePreferences(preferences);
    Object.entries(preferenceAttributes(prefs)).forEach(([name, value]) => {
        if (value === null) root.removeAttribute(name);
        else root.setAttribute(name, value);
    });
    Object.entries(themeVariables(prefs)).forEach(([name, value]) => {
        if (value === null) root.style.removeProperty(name);
        else root.style.setProperty(name, value);
    });
    loadFont(prefs.font);
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

/** Remove every googtrans cookie this page can see, including ones on parent domains. */
function clearTranslateCookies() {
    const expired = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    document.cookie = expired;
    translateCookieDomains(window.location.hostname).forEach(domain => {
        document.cookie = `${expired}; domain=${domain}`;
        document.cookie = `${expired}; domain=.${domain}`;
    });
}

/**
 * Switch to a new language by reloading the page. Google Translate only reads its
 * 'googtrans' cookie when it starts, and its language menu is never rendered on these
 * pages, so changing language in place is unreliable (it stuck on the first language).
 * After the reload, applySavedPreferences translates the page from the saved setting.
 */
export function reloadInLanguage(language) {
    clearTranslateCookies();
    if (language) document.cookie = `googtrans=/en/${language}; path=/`;
    window.location.reload();
}

/**
 * Forget this device's Shoreline preferences (language, theme, font, look, read aloud) and
 * the translate cookie, so the next page loads with the defaults. Called on log out; the
 * account keeps its copy, which comes back on the next sign-in.
 */
export function resetPreferences() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(THEME_CACHE_KEY);
        localStorage.removeItem(UNSYNCED_KEY);
    } catch (err) {
        console.warn('Shoreline: could not clear saved preferences', err);
    }
    clearTranslateCookies();
}

/** Apply everything saved; runs on every Shoreline page from _includes/shoreline/header.html. */
export function applySavedPreferences() {
    const prefs = loadPreferences();
    applyLook(prefs);
    // A leftover cookie (an old choice, or one an OCS site set on a parent domain)
    // would make Google Translate ignore the saved language, so start clean.
    clearTranslateCookies();
    if (prefs.language) applyLanguage(prefs.language);
    mountReadAloud(prefs.readAloud);
    return prefs;
}
