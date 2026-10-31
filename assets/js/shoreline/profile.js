---
---
// Shoreline profile page (/shoreline/profile): edit your details and log volunteer hours.
//
// Saves to Flask (GET/PUT /api/shoreline/profile, POST/DELETE /api/shoreline/hours) when the
// backend has the Shoreline routes. The OCS class backend doesn't have them yet, so there
// the page keeps the same data on this device instead (deviceStore) and says so.

import { apiURI, getShorelineUser, renderShorelineAuth } from '{{ site.baseurl }}/assets/js/shoreline/auth.js';
import { fetchOptions } from '{{ site.baseurl }}/assets/js/api/config.js';

const CHOICE_LABELS = { volunteer: 'Volunteer', donate: 'Donate', none: 'Just browsing' };
const PROFILE_FIELDS = ['phone', 'neighborhood', 'availability', 'bio'];

async function readJson(res) {
    const raw = await res.text();
    try { return raw ? JSON.parse(raw) : {}; } catch (_) { return { message: raw }; }
}

// ---- Data stores: same four methods, server or this device ----

function serverStore() {
    async function call(path, method = 'GET', body) {
        // Plain GETs skip the JSON headers so the browser sends no CORS preflight. A backend
        // without the Shoreline routes then answers with a real 404 (and we fall back to the
        // device); a preflight would fail first and show up only as "Failed to fetch".
        const options = method === 'GET'
            ? { mode: 'cors', credentials: 'include', cache: 'no-store' }
            : { ...fetchOptions, method, ...(body ? { body: JSON.stringify(body) } : {}) };
        const res = await fetch(`${apiURI}/api/shoreline${path}`, options);
        const data = await readJson(res);
        if (!res.ok) {
            const err = new Error(data.message || `Request failed (${res.status})`);
            err.status = res.status;
            throw err;
        }
        return data;
    }
    return {
        onServer: true,
        load: () => call('/profile'),
        save: fields => call('/profile', 'PUT', fields),
        addHours: entry => call('/hours', 'POST', entry),
        deleteHours: id => call(`/hours/${id}`, 'DELETE'),
    };
}

function deviceStore(user) {
    const key = `shoreline.profile.${user.uid}`;
    const read = () => {
        try { return JSON.parse(localStorage.getItem(key)) || {}; } catch (_) { return {}; }
    };
    const write = data => {
        localStorage.setItem(key, JSON.stringify(data));
        return withTotals(data);
    };
    const withTotals = data => {
        const hours = (data.hours || []).slice().sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
        return {
            name: user.name, email: user.email && user.email !== '?' ? user.email : '',
            interests: [], choice: null, ...data, hours,
            total_hours: Math.round(hours.reduce((sum, h) => sum + h.hours, 0) * 100) / 100,
            shifts: hours.length,
        };
    };
    return {
        onServer: false,
        load: async () => withTotals(read()),
        save: async fields => write({ ...read(), ...fields }),
        addHours: async entry => {
            const data = read();
            const hours = data.hours || [];
            hours.push({ ...entry, hours: Number(entry.hours), id: Date.now() });
            return write({ ...data, hours });
        },
        deleteHours: async id => {
            const data = read();
            return write({ ...data, hours: (data.hours || []).filter(h => h.id !== id) });
        },
    };
}

/** Use the server when it has the Shoreline routes (a 404 means the route isn't there). */
async function pickStore(user) {
    const server = serverStore();
    try {
        return { store: server, profile: await server.load() };
    } catch (err) {
        if (err.status !== 404) throw err;
        const device = deviceStore(user);
        return { store: device, profile: await device.load() };
    }
}

// ---- Rendering ----

const $ = id => document.getElementById(id);

function formatHours(n) {
    return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, '');
}

function renderStats(profile) {
    $('statHours').textContent = formatHours(profile.total_hours || 0);
    $('statShifts').textContent = String(profile.shifts || 0);
    $('statChoice').textContent = CHOICE_LABELS[profile.choice] || '—';
    $('profileGreeting').textContent = profile.name ? `Hi, ${profile.name}!` : 'My Shoreline Profile';
}

function initials(name = '') {
    return name.trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '?';
}

/** A profile is "new" until any of its own details have been filled in. */
function isNewProfile(profile) {
    return !['phone', 'neighborhood', 'availability', 'bio'].some(f => profile[f]) && !(profile.interests || []).length;
}

function renderCard(profile, uid) {
    $('cardAvatar').textContent = initials(profile.name);
    $('cardAvatar').title = profile.name || uid;
    $('cardName').textContent = profile.name || uid;
    $('cardMeta').textContent = [`@${uid}`, profile.neighborhood, profile.availability].filter(Boolean).join(' · ');
    $('cardBio').textContent = profile.bio || 'No bio yet. Click Edit Profile to add one.';
    const pills = $('cardInterests');
    pills.replaceChildren(...(profile.interests || []).map(interest => {
        const pill = document.createElement('span');
        pill.className = 'ocs__status-pill';
        pill.textContent = interest;
        return pill;
    }));
}

// Use form.elements: form.name is the form's own name attribute, not the Name input.
function fillForm(profile) {
    const form = $('profileForm').elements;
    form.name.value = profile.name || '';
    form.email.value = profile.email || '';
    form.choice.value = profile.choice || '';
    PROFILE_FIELDS.forEach(f => { form[f].value = profile[f] || ''; });
    const chosen = new Set(profile.interests || []);
    $('profileForm').querySelectorAll('input[name="interests"]').forEach(box => { box.checked = chosen.has(box.value); });
}

function renderHours(profile, onDelete) {
    const rows = $('hoursRows');
    rows.replaceChildren();
    (profile.hours || []).forEach(entry => {
        const tr = document.createElement('tr');
        [entry.date, entry.activity, formatHours(entry.hours), entry.notes || ''].forEach(text => {
            const td = document.createElement('td');
            td.textContent = text;  // user text: never innerHTML
            tr.append(td);
        });
        const td = document.createElement('td');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ocs__btn small alert-red';
        btn.textContent = 'Remove';
        btn.addEventListener('click', () => onDelete(entry.id, btn));
        td.append(btn);
        tr.append(td);
        rows.append(tr);
    });
    $('hoursEmpty').hidden = (profile.hours || []).length > 0;
}

function today() {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

// ---- Page ----

export async function initProfilePage() {
    renderShorelineAuth($('shorelineAuthArea'));
    const user = await getShorelineUser();
    if (!user) {
        $('profileSignedOut').hidden = false;
        return;
    }

    let store;
    let profile;
    try {
        ({ store, profile } = await pickStore(user));
    } catch (err) {
        $('profileStorageNote').textContent = err instanceof TypeError
            ? 'Couldn\'t reach the Shoreline server. It may be waking up; refresh in a minute.'
            : `Couldn't load your profile: ${err.message}`;
        return;
    }
    $('profileStorageNote').textContent = store.onServer
        ? ''
        : 'This server doesn\'t store Shoreline profiles yet, so your details and hours are saved on this device only.';

    const show = updated => {
        profile = updated;
        renderCard(profile, user.uid);
        renderStats(profile);
        renderHours(profile, deleteEntry);
    };

    const setEditing = editing => {
        $('profileEditSection').hidden = !editing;
        $('editProfileBtn').hidden = editing;
        if (editing) {
            fillForm(profile);
            $('profileStatus').textContent = '';
            $('profileEditSection').scrollIntoView({ behavior: 'smooth' });
        }
    };
    $('editProfileBtn').addEventListener('click', () => setEditing(true));
    $('cancelEditBtn').addEventListener('click', () => setEditing(false));

    async function deleteEntry(id, btn) {
        btn.disabled = true;
        try {
            show(await store.deleteHours(id));
        } catch (err) {
            $('hoursStatus').textContent = err.message;
            btn.disabled = false;
        }
    }

    show(profile);
    $('hoursDate').value = today();
    $('hoursDate').max = today();
    $('profileApp').hidden = false;

    // First visit: open the form so the user creates their profile right away.
    if (isNewProfile(profile)) {
        $('profileEditTitle').textContent = 'Create Your Profile';
        setEditing(true);
    }

    $('profileForm').addEventListener('submit', async event => {
        event.preventDefault();
        const form = event.target;
        const el = form.elements;
        const status = $('profileStatus');
        const fields = {
            name: el.name.value.trim(),
            email: el.email.value.trim(),
            interests: [...form.querySelectorAll('input[name="interests"]:checked')].map(b => b.value),
        };
        PROFILE_FIELDS.forEach(f => { fields[f] = el[f].value.trim(); });
        if (el.choice.value) fields.choice = el.choice.value;

        form.querySelector('button[type=submit]').disabled = true;
        status.textContent = 'Saving...';
        try {
            show(await store.save(fields));
            $('profileEditTitle').textContent = 'Edit My Profile';
            setEditing(false);
        } catch (err) {
            status.textContent = err.message;
        } finally {
            form.querySelector('button[type=submit]').disabled = false;
        }
    });

    $('hoursForm').addEventListener('submit', async event => {
        event.preventDefault();
        const form = event.target;
        const el = form.elements;
        const status = $('hoursStatus');
        const entry = {
            date: el.date.value,
            activity: el.activity.value,
            hours: Number(el.hours.value),
            notes: el.notes.value.trim(),
        };
        form.querySelector('button[type=submit]').disabled = true;
        status.textContent = 'Adding...';
        try {
            show(await store.addHours(entry));
            status.textContent = `Added ${formatHours(entry.hours)} hours.`;
            el.notes.value = '';
        } catch (err) {
            status.textContent = err.message;
        } finally {
            form.querySelector('button[type=submit]').disabled = false;
        }
    });
}
