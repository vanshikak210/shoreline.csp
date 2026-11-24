---
---
// Keeps Shoreline preferences on the signed-in account (GET/PUT /api/shoreline/preferences),
// so they follow the person to any device and come back after logging out.
// The device copy (preferences-store.js) still applies first on every page, so pages load
// with the right look before the account answers; signed-out visitors keep device-only settings.

import { apiURI, usesOcsBackend, getShorelineUser } from '{{ site.baseurl }}/assets/js/shoreline/auth.js';
import { fetchOptions } from '{{ site.baseurl }}/assets/js/api/config.js';
import { normalizePreferences, accountSyncAction } from '{{ site.baseurl }}/assets/js/shoreline/preferences-model.js';
import {
    loadPreferences, savePreferences, applyLook, reloadInLanguage, markUnsynced, hasUnsyncedChanges,
} from '{{ site.baseurl }}/assets/js/shoreline/preferences-store.js';
import { mountReadAloud } from '{{ site.baseurl }}/assets/js/shoreline/read-aloud.js';

const ENDPOINT = `${apiURI}/api/shoreline/preferences`;

async function fetchAccountPreferences() {
    const res = await fetch(ENDPOINT, fetchOptions);
    if (!res.ok) throw new Error(`could not load account preferences (${res.status})`);
    const data = await res.json();
    return data.preferences ?? null;
}

async function putAccountPreferences(prefs) {
    const res = await fetch(ENDPOINT, { ...fetchOptions, method: 'PUT', body: JSON.stringify({ preferences: prefs }) });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `could not save to your account (${res.status})`);
    }
}

/** Upload, clearing the unsynced flag only once the account has the changes. */
async function upload(prefs) {
    markUnsynced(true);
    await putAccountPreferences(prefs);
    markUnsynced(false);
}

/**
 * Save on this device, and on the account when signed in.
 * Resolves to 'account' or 'device' (signed out, or the OCS class backend without this route).
 * Throws when the account save fails; the device copy is kept and uploaded on a later page.
 */
export async function savePreferencesEverywhere(preferences) {
    const prefs = savePreferences(preferences);
    const user = await getShorelineUser();
    if (!user || usesOcsBackend) return { prefs, savedTo: 'device' };
    await upload(prefs);
    return { prefs, savedTo: 'account' };
}

let syncPromise = null;

/**
 * On page load for a signed-in user: bring this device and the account into line
 * (see accountSyncAction). A different language from the account reloads the page into it.
 * Runs once per page; the header and the Preferences page share the same promise.
 */
export function syncPreferencesWithAccount() {
    if (!syncPromise) syncPromise = runSync();
    return syncPromise;
}

async function runSync() {
    const user = await getShorelineUser();
    if (!user || usesOcsBackend) return;
    const local = loadPreferences();
    try {
        const remote = await fetchAccountPreferences();
        const action = accountSyncAction({ remote, local, unsynced: hasUnsyncedChanges() });
        if (action === 'upload') await upload(local);
        if (action !== 'download') return;
        const prefs = savePreferences(normalizePreferences(remote));
        applyLook(prefs);
        mountReadAloud(prefs.readAloud);
        if (prefs.language !== local.language) reloadInLanguage(prefs.language);
    } catch (err) {
        // Offline or backend asleep: the device copy keeps working and syncs on a later page.
        console.warn('Shoreline: preferences not synced with your account this time', err);
    }
}
