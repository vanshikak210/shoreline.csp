---
---
// Floating language button (bottom right of every Shoreline page, from footer.html).
// Opens a small panel with the language list and a link to the full Preferences page.
// Uses the same saved preferences as /shoreline/preferences, so the two never disagree.
// (The read-aloud button sits bottom left, so the two don't overlap.)

import { LANGUAGES } from '{{ site.baseurl }}/assets/js/shoreline/preferences-model.js';
import { loadPreferences, reloadInLanguage } from '{{ site.baseurl }}/assets/js/shoreline/preferences-store.js';
import { savePreferencesEverywhere } from '{{ site.baseurl }}/assets/js/shoreline/preferences-account.js';

const GLOBE = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>';

export function mountLanguageButton(preferencesUrl) {
    if (document.querySelector('.sl-lang-fab')) return;
    const prefs = loadPreferences();

    const wrap = document.createElement('div');
    // notranslate: Google Translate must not rewrite the language names or the controls.
    wrap.className = 'sl-lang-fab notranslate';
    wrap.setAttribute('translate', 'no');
    wrap.innerHTML = `
        <div class="sl-lang-fab__panel" id="slLangPanel" role="dialog" aria-label="Language" hidden>
            <label class="ocs__label" for="slLangSelect">Language / Idioma</label>
            <select class="ocs__input medium" id="slLangSelect"></select>
            <a class="sl-lang-fab__more" href="${preferencesUrl}">More preferences: themes, text size, read aloud</a>
        </div>
        <button type="button" class="sl-lang-fab__btn" aria-expanded="false" aria-controls="slLangPanel"
                aria-label="Change language and preferences" title="Language and preferences">${GLOBE}</button>`;

    const select = wrap.querySelector('select');
    LANGUAGES.forEach(({ value, label }) => select.add(new Option(label, value, false, value === prefs.language)));

    const btn = wrap.querySelector('.sl-lang-fab__btn');
    const panel = wrap.querySelector('.sl-lang-fab__panel');
    const setOpen = open => {
        panel.hidden = !open;
        btn.setAttribute('aria-expanded', String(open));
        if (open) select.focus();
    };
    btn.addEventListener('click', event => { event.stopPropagation(); setOpen(panel.hidden); });
    document.addEventListener('click', event => { if (!wrap.contains(event.target)) setOpen(false); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) { setOpen(false); btn.focus(); } });

    // Google Translate only switches language on page load, so save, then reload.
    // Wait for the account save first: reloading would cancel the request.
    select.addEventListener('change', async () => {
        select.disabled = true;
        try {
            await savePreferencesEverywhere({ ...loadPreferences(), language: select.value });
        } catch (err) {
            // Kept on this device and uploaded on a later page (see preferences-account.js).
            console.warn('Shoreline: language saved on this device only for now', err);
        }
        reloadInLanguage(select.value);
    });

    document.body.append(wrap);
}
