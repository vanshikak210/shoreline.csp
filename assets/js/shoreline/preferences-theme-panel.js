// Theme, font and "My Themes" cards on /shoreline/preferences.
// The panel only reports changes through `update`; preferences.js owns the draft and saving.

import { THEMES, FONTS, CUSTOM_THEME, customPalette } from './theme-model.js';

const $ = id => document.getElementById(id);

function swatchStyle(palette) {
    return `background: linear-gradient(135deg, ${palette.page} 0 50%, ${palette.accent} 50% 100%);`
        + ` border-color: ${palette.border};`;
}

/** A radio-style button per preset plus "Custom"; the swatch is decoration only. */
function buildThemeButtons(group) {
    const options = [...THEMES.map(theme => ({ id: theme.id, label: theme.label, palette: theme.palette })),
        { id: CUSTOM_THEME, label: 'Custom', palette: null }];
    group.innerHTML = '';
    options.forEach(option => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'ocs__btn medium accent sl-prefs__theme';
        button.setAttribute('role', 'radio');
        button.dataset.theme = option.id;
        const swatch = document.createElement('i');
        swatch.className = 'sl-prefs__swatch';
        swatch.setAttribute('aria-hidden', 'true');
        if (option.palette) swatch.style.cssText = swatchStyle(option.palette);
        button.append(swatch, option.label);
        group.appendChild(button);
    });
}

function renderSavedThemes(list, savedThemes) {
    list.innerHTML = '';
    savedThemes.forEach((theme, index) => {
        const item = document.createElement('li');
        const swatch = document.createElement('i');
        swatch.className = 'sl-prefs__swatch';
        swatch.setAttribute('aria-hidden', 'true');
        swatch.style.cssText = swatchStyle(customPalette(theme.colors));
        const name = document.createElement('strong');
        name.textContent = theme.name;
        const use = document.createElement('button');
        use.type = 'button';
        use.className = 'ocs__btn small accent';
        use.dataset.useTheme = String(index);
        use.textContent = 'Use';
        use.setAttribute('aria-label', `Use ${theme.name}`);
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'ocs__btn small accent';
        remove.dataset.deleteTheme = String(index);
        remove.textContent = 'Delete';
        remove.setAttribute('aria-label', `Delete ${theme.name}`);
        item.append(swatch, name, use, remove);
        list.appendChild(item);
    });
    $('savedThemeEmpty').hidden = savedThemes.length > 0;
}

/**
 * Wire the theme cards. `getDraft()` returns the current unsaved preferences,
 * `update(changes)` previews a change, and `persist(changes, message)` saves it at once.
 */
export function createThemePanel({ getDraft, update, persist, status }) {
    buildThemeButtons($('prefTheme'));
    $('prefFont').innerHTML = '';
    FONTS.forEach(({ id, label }) => $('prefFont').add(new Option(label, id)));

    $('prefTheme').addEventListener('click', event => {
        const button = event.target.closest('[data-theme]');
        if (button) update({ theme: button.dataset.theme });
    });
    $('prefFont').addEventListener('change', event => update({ font: event.target.value }));
    document.querySelectorAll('[data-custom-color]').forEach(input => {
        input.addEventListener('input', () => {
            const draft = getDraft();
            update({ theme: CUSTOM_THEME, customColors: { ...draft.customColors, [input.dataset.customColor]: input.value } });
        });
    });

    $('saveCustomThemeBtn').addEventListener('click', () => {
        const name = $('customThemeName').value.trim();
        if (!name) {
            status('Give your theme a name first.');
            $('customThemeName').focus();
            return;
        }
        const draft = getDraft();
        // Saving under an existing name replaces that theme (the newest comes first).
        const others = draft.savedThemes.filter(theme => theme.name.toLowerCase() !== name.toLowerCase());
        persist({
            theme: CUSTOM_THEME,
            savedThemes: [{ name, colors: draft.customColors, font: draft.font }, ...others],
        }, `Saved "${name}" to My Themes.`);
        $('customThemeName').value = '';
    });

    $('savedThemeList').addEventListener('click', event => {
        const draft = getDraft();
        const useButton = event.target.closest('[data-use-theme]');
        const deleteButton = event.target.closest('[data-delete-theme]');
        if (useButton) {
            const theme = draft.savedThemes[Number(useButton.dataset.useTheme)];
            if (theme) update({ theme: CUSTOM_THEME, customColors: theme.colors, font: theme.font });
        } else if (deleteButton) {
            const index = Number(deleteButton.dataset.deleteTheme);
            const theme = draft.savedThemes[index];
            if (theme) persist({ savedThemes: draft.savedThemes.filter((_, i) => i !== index) }, `Deleted "${theme.name}".`);
        }
    });

    return {
        render(draft) {
            $('prefTheme').querySelectorAll('[data-theme]').forEach(button => {
                const on = button.dataset.theme === draft.theme;
                button.classList.toggle('fill', on);
                button.setAttribute('aria-checked', String(on));
            });
            $('themeContrastNote').hidden = !draft.highContrast;
            $('prefFont').value = draft.font;
            $('customPage').value = draft.customColors.page;
            $('customText').value = draft.customColors.text;
            $('customAccent').value = draft.customColors.accent;
            renderSavedThemes($('savedThemeList'), draft.savedThemes);
        },
    };
}
