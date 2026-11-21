---
---
// Shoreline preferences page (/shoreline/preferences): language, theme, font, look and read-aloud.
// Changes preview as you pick them; Save keeps them on this device for every Shoreline page.
// The page keeps one draft of the preferences; the theme and speech panels report changes to it.

import { getShorelineUser } from '{{ site.baseurl }}/assets/js/shoreline/auth.js';
import { LANGUAGES, TEXT_SIZES, DEFAULT_PREFERENCES, normalizePreferences } from '{{ site.baseurl }}/assets/js/shoreline/preferences-model.js';
import { loadPreferences, savePreferences, applyLook, reloadInLanguage } from '{{ site.baseurl }}/assets/js/shoreline/preferences-store.js';
import { mountReadAloud, stopSpeaking } from '{{ site.baseurl }}/assets/js/shoreline/read-aloud.js';
import { createThemePanel } from '{{ site.baseurl }}/assets/js/shoreline/preferences-theme-panel.js';
import { createSpeechPanel } from '{{ site.baseurl }}/assets/js/shoreline/preferences-speech-panel.js';

const $ = id => document.getElementById(id);

function buildLanguageOptions(select) {
    select.innerHTML = '';
    LANGUAGES.forEach(({ value, label }) => select.add(new Option(label, value)));
}

function buildTextSizeButtons(group) {
    group.innerHTML = TEXT_SIZES.map(({ value, label }) =>
        `<button type="button" class="ocs__btn small accent" role="radio" data-text-size="${value}">${label}</button>`).join('');
}

function renderLookCard(prefs) {
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
    let draft = saved;

    const status = message => { $('preferencesStatus').textContent = message; };
    const panels = [];
    const render = () => {
        renderLookCard(draft);
        panels.forEach(panel => panel.render(draft));
    };

    // Saves preferences; a new language reloads the page, because Google Translate
    // only picks up a language when a page loads.
    const keep = (prefs, message = 'Saved. These settings apply on every Shoreline page on this device.') => {
        const previousLanguage = saved.language;
        try {
            saved = savePreferences(prefs);
        } catch (err) {
            status(`Couldn't save on this device: ${err.message}`);
            return;
        }
        draft = saved;
        render();
        applyLook(saved);
        mountReadAloud(saved.readAloud);
        if (saved.language !== previousLanguage) {
            status('Saved. Reloading in your language…');
            reloadInLanguage(saved.language);
            return;
        }
        status(message);
    };

    // Look changes preview right away; language and the read-aloud button wait for Save.
    const update = changes => {
        draft = normalizePreferences({ ...draft, ...changes });
        render();
        applyLook(draft);
        status('Previewing. Save to keep these settings.');
    };
    // Saved-theme edits are saved at once (with the rest of the draft) so they aren't lost.
    const persist = (changes, message) => keep({ ...draft, ...changes }, message);
    const getDraft = () => draft;

    panels.push(createThemePanel({ getDraft, update, persist, status }));
    panels.push(createSpeechPanel({ getDraft, update }));
    render();

    $('prefTextSize').addEventListener('click', event => {
        const btn = event.target.closest('[data-text-size]');
        if (btn) update({ textSize: btn.dataset.textSize });
    });
    $('prefLanguage').addEventListener('change', event => {
        draft = normalizePreferences({ ...draft, language: event.target.value });
        status('Save to switch the language.');
    });
    $('prefHighContrast').addEventListener('change', event => update({ highContrast: event.target.checked }));
    $('prefReduceMotion').addEventListener('change', event => update({ reduceMotion: event.target.checked }));

    $('preferencesForm').addEventListener('submit', event => {
        event.preventDefault();
        keep(draft);
    });
    // Reset keeps saved themes: they are the person's own work, deleted one at a time.
    $('resetPreferencesBtn').addEventListener('click', () => {
        stopSpeaking();
        keep({ ...DEFAULT_PREFERENCES, savedThemes: saved.savedThemes }, 'Back to Shoreline’s default settings.');
    });
}
