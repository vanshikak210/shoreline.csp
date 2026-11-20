---
---
// Shoreline preferences page (/shoreline/preferences): language and how the site looks.
// Changes preview as you pick them; Save keeps them on this device for every Shoreline page.

import { getShorelineUser } from '{{ site.baseurl }}/assets/js/shoreline/auth.js';
import { LANGUAGES, TEXT_SIZES, DEFAULT_PREFERENCES, normalizePreferences } from '{{ site.baseurl }}/assets/js/shoreline/preferences-model.js';
import { loadPreferences, savePreferences, applyLook, applyLanguage } from '{{ site.baseurl }}/assets/js/shoreline/preferences-store.js';

const $ = id => document.getElementById(id);

function buildLanguageOptions(select) {
    select.innerHTML = '';
    LANGUAGES.forEach(({ value, label }) => select.add(new Option(label, value)));
}

function buildTextSizeButtons(group) {
    group.innerHTML = TEXT_SIZES.map(({ value, label }) =>
        `<button type="button" class="ocs__btn small accent" role="radio" data-text-size="${value}">${label}</button>`).join('');
}

function readForm() {
    const selected = $('prefTextSize').querySelector('[aria-checked="true"]');
    return normalizePreferences({
        language: $('prefLanguage').value,
        textSize: selected?.dataset.textSize,
        highContrast: $('prefHighContrast').checked,
        reduceMotion: $('prefReduceMotion').checked,
    });
}

function fillForm(prefs) {
    $('prefLanguage').value = prefs.language;
    $('prefTextSize').querySelectorAll('[data-text-size]').forEach(btn => {
        const on = btn.dataset.textSize === prefs.textSize;
        btn.classList.toggle('fill', on);
        btn.setAttribute('aria-checked', String(on));
    });
    $('prefHighContrast').checked = prefs.highContrast;
    $('prefReduceMotion').checked = prefs.reduceMotion;
}

export async function initPreferencesPage() {
    const user = await getShorelineUser();
    if (!user) {
        $('preferencesSignedOut').hidden = false;
        return;
    }
    $('preferencesForm').hidden = false;

    buildLanguageOptions($('prefLanguage'));
    buildTextSizeButtons($('prefTextSize'));
    let saved = loadPreferences();
    fillForm(saved);

    const status = message => { $('preferencesStatus').textContent = message; };

    // Look changes preview right away; language waits for Save because translating
    // reloads Google Translate and rewrites the page (including this form's labels).
    const previewLook = () => {
        applyLook(readForm());
        status('Previewing. Save to keep these settings.');
    };
    $('prefTextSize').addEventListener('click', event => {
        const btn = event.target.closest('[data-text-size]');
        if (!btn) return;
        fillForm({ ...readForm(), textSize: btn.dataset.textSize });
        previewLook();
    });
    $('prefHighContrast').addEventListener('change', previewLook);
    $('prefReduceMotion').addEventListener('change', previewLook);

    const keep = prefs => {
        try {
            saved = savePreferences(prefs);
        } catch (err) {
            status(`Couldn't save on this device: ${err.message}`);
            return;
        }
        fillForm(saved);
        applyLook(saved);
        applyLanguage(saved.language);
        status('Saved. These settings apply on every Shoreline page on this device.');
    };

    $('preferencesForm').addEventListener('submit', event => {
        event.preventDefault();
        keep(readForm());
    });
    $('resetPreferencesBtn').addEventListener('click', () => keep(DEFAULT_PREFERENCES));
}
