---
---
// Shoreline auth helpers, built on the OCS Flask backend (pythonURI in api/config.js).
//
// Session = the JWT cookie Flask sets on POST /api/authenticate. It is httpOnly and
// sent automatically (fetchOptions has credentials: 'include'), so "staying logged in"
// is just a matter of asking /api/id on each page load instead of hiding a form.
//
// This file deliberately does NOT use id="loginArea": the OCS theme's api/login.js
// rewrites any #loginArea on the page into a link to the CSP /login page, which is
// what kept bouncing the Shoreline header back there.

import { baseurl, pythonURI, fetchOptions } from '{{ site.baseurl }}/assets/js/api/config.js';

const SURVEY_KEY = 'shoreline.survey';

async function readJson(response) {
    const raw = await response.text();
    try { return raw ? JSON.parse(raw) : {}; } catch (_) { return { message: raw }; }
}

// One /api/id request per page load: the header and the login page both ask for the
// user, so share a single in-flight promise instead of hitting the backend twice.
let currentUserPromise = null;

function rememberUser(user) {
    currentUserPromise = Promise.resolve(user);
    return user;
}

/** Current user from /api/id, or null when there is no valid session. */
export function getShorelineUser() {
    if (!currentUserPromise) {
        currentUserPromise = fetch(`${pythonURI}/api/id`, fetchOptions)
            .then(res => (res.ok ? res.json() : null))
            .catch(err => {
                console.warn('Shoreline: could not reach backend for /api/id', err);
                return null;
            });
    }
    return currentUserPromise;
}

/** POST /api/authenticate. Resolves to the user on success, throws with a readable message otherwise. */
export async function shorelineLogin(uid, password) {
    const res = await fetch(`${pythonURI}/api/authenticate`, {
        ...fetchOptions,
        method: 'POST',
        cache: 'no-cache',
        body: JSON.stringify({ uid, password }),
    });
    if (!res.ok) {
        const data = await readJson(res);
        throw new Error(data.message || (res.status === 401 ? 'Wrong username or password.' : `Login failed (${res.status})`));
    }
    // /api/authenticate already returns the user, so skip a second /api/id round trip.
    const data = await readJson(res);
    return rememberUser(data.user || { uid, name: uid });
}

/**
 * POST /api/shoreline/signup then log in. Shoreline has its own signup route because the
 * OCS /api/user route only accepts real GitHub usernames and leaves accounts inactive
 * until a teacher approves them (see docs/shoreline-backend/shoreline.py).
 */
export async function shorelineSignup({ name, uid, email, password }) {
    const res = await fetch(`${pythonURI}/api/shoreline/signup`, {
        ...fetchOptions,
        method: 'POST',
        body: JSON.stringify({ name, uid, email, password }),
    });
    const data = await readJson(res);
    if (!res.ok) {
        throw new Error(res.status === 404
            ? 'Signup route missing on the Flask server: add api/shoreline.py (see docs/shoreline-backend).'
            : (data.message || `Sign up failed (${res.status})`));
    }
    return shorelineLogin(uid, password);
}

/** DELETE /api/authenticate clears the JWT cookie. */
export async function shorelineLogout() {
    try {
        await fetch(`${pythonURI}/api/authenticate`, { ...fetchOptions, method: 'DELETE' });
    } catch (err) {
        console.warn('Shoreline: logout request failed', err);
    }
    localStorage.removeItem(SURVEY_KEY);
    rememberUser(null);
}

/**
 * Save the donate / volunteer / none choice.
 * Goes to Flask (POST /api/shoreline/survey, authenticated by the JWT cookie) and is
 * mirrored in localStorage so the UI still knows the answer if the request fails.
 */
export async function saveSurveyChoice(choice) {
    localStorage.setItem(SURVEY_KEY, JSON.stringify({ choice, at: Date.now() }));
    const res = await fetch(`${pythonURI}/api/shoreline/survey`, {
        ...fetchOptions,
        method: 'POST',
        body: JSON.stringify({ choice }),
    });
    if (!res.ok) {
        const data = await readJson(res);
        throw new Error(data.message || `Survey save failed (${res.status})`);
    }
    return readJson(res);
}

/**
 * The logged-in user's saved survey choice from Flask, or null if they haven't answered.
 * Server is the source of truth (localStorage is per-device and per-browser).
 */
export async function getSurveyChoice() {
    try {
        const res = await fetch(`${pythonURI}/api/shoreline/survey`, fetchOptions);
        if (!res.ok) return null;  // 404 = no answer yet, 401 = not logged in
        const data = await res.json();
        return data.choice || null;
    } catch (err) {
        console.warn('Shoreline: could not load survey choice', err);
        return null;
    }
}

export function getSavedSurveyChoice() {
    try { return JSON.parse(localStorage.getItem(SURVEY_KEY) || 'null'); } catch (_) { return null; }
}

/**
 * Run a backend call, and if it takes longer than `afterMs` call `onSlow()` once.
 * Render's free plan sleeps when idle and takes up to a minute to wake, so tell the
 * user why they're waiting instead of leaving a frozen button.
 */
export async function withSlowNotice(promise, onSlow, afterMs = 3000) {
    const timer = setTimeout(onSlow, afterMs);
    try {
        return await promise;
    } finally {
        clearTimeout(timer);
    }
}

function initials(name = '') {
    return name.trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '?';
}

/**
 * Render the header auth slot: Login button when signed out, avatar + dropdown when signed in.
 * `el` is the container (e.g. #shorelineAuthArea). Returns the user or null.
 */
export async function renderShorelineAuth(el) {
    if (!el) return null;
    const user = await getShorelineUser();

    if (!user) {
        el.innerHTML = `<a class="ocs__btn medium accent" href="${baseurl}/shoreline-login">Login</a>`;
        return null;
    }

    const avatar = user.pfp
        ? `<img class="sl-avatar__img" src="${user.pfp.startsWith('data:') || user.pfp.startsWith('http') ? user.pfp : `${pythonURI}/${user.pfp}`}" alt="">`
        : `<span class="sl-avatar__initials">${initials(user.name)}</span>`;

    el.innerHTML = `
        <div class="sl-avatar">
            <button type="button" class="sl-avatar__btn" aria-haspopup="true" aria-expanded="false" title="${user.name || user.uid}">
                ${avatar}
            </button>
            <div class="sl-avatar__menu" hidden>
                <div class="sl-avatar__name">${user.name || user.uid}</div>
                <a href="${baseurl}/profile">Profile</a>
                <a href="${baseurl}/shoreline-login?update=1">Update my choice</a>
                <button type="button" class="sl-avatar__logout">Log out</button>
            </div>
        </div>`;

    const btn = el.querySelector('.sl-avatar__btn');
    const menu = el.querySelector('.sl-avatar__menu');
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.hidden = !menu.hidden;
        btn.setAttribute('aria-expanded', String(!menu.hidden));
    });
    document.addEventListener('click', (e) => {
        if (!el.contains(e.target)) { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
    });
    el.querySelector('.sl-avatar__logout').addEventListener('click', async () => {
        await shorelineLogout();
        window.location.href = `${baseurl}/`;
    });

    return user;
}
