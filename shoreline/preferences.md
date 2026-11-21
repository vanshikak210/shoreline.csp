---
layout: shoreline-account
account_tab: preferences
title: Preferences | Shoreline Community Services
permalink: /shoreline/preferences
search_exclude: true
show_reading_time: false
custom_header: true
---
{%- assign p = site.data.shoreline_pages.preferences -%}
<!-- markdownlint-disable MD033 -->
<header class="sl-account__head">
    <h1>{{ p.title }}</h1>
    <p>{{ p.lead }}</p>
</header>

<section class="ocs__card" id="preferencesSignedOut" hidden>
    <h2 class="ocs__section-title">Sign in to set your preferences</h2>
    <a class="ocs__btn medium accent fill" href="{{ '/shoreline-login' | relative_url }}">Sign In</a>
</section>

<form class="sl-form sl-prefs" id="preferencesForm" aria-labelledby="preferencesTitle" hidden>
<section class="ocs__card">
    <h2 class="ocs__section-title" id="preferencesTitle">Language &amp; Look</h2>
    <div class="ocs__grid--col2">
        <div class="ocs__field">
            <label class="ocs__label" for="prefLanguage">Language</label>
            <select class="ocs__input medium" id="prefLanguage" name="language"></select>
            <small>Translated automatically by Google Translate.</small>
        </div>
        <div class="ocs__field">
            <span class="ocs__label">Text size</span>
            <div class="ocs__links" id="prefTextSize" role="radiogroup" aria-label="Text size"></div>
        </div>
        <div class="ocs__field">
            <span class="ocs__label">Contrast</span>
            <label class="ocs__toggle">
                <input class="ocs__toggle-input" type="checkbox" id="prefHighContrast" name="highContrast">
                <span class="ocs__toggle-track"></span>
                <span class="ocs__toggle-label">High contrast</span>
            </label>
        </div>
        <div class="ocs__field">
            <span class="ocs__label">Motion</span>
            <label class="ocs__toggle">
                <input class="ocs__toggle-input" type="checkbox" id="prefReduceMotion" name="reduceMotion">
                <span class="ocs__toggle-track"></span>
                <span class="ocs__toggle-label">Reduce motion</span>
            </label>
        </div>
    </div>
</section>

<section class="ocs__card" aria-labelledby="themeTitle">
    <h2 class="ocs__section-title" id="themeTitle">Theme</h2>
    <div class="sl-prefs__themes" id="prefTheme" role="radiogroup" aria-labelledby="themeTitle"></div>
    <p class="sl-note" id="themeContrastNote" hidden>High contrast is on, so it replaces the theme colors until you turn it off.</p>
    <div class="ocs__grid--col2">
        <div class="ocs__field">
            <label class="ocs__label" for="prefFont">Font</label>
            <select class="ocs__input medium" id="prefFont" name="font"></select>
        </div>
    </div>
</section>

<section class="ocs__card" aria-labelledby="customThemeTitle">
    <h2 class="ocs__section-title" id="customThemeTitle">My Themes</h2>
    <p class="sl-note">Pick your own colors. They preview right away; save them as a named theme to come back to later.</p>
    <div class="sl-prefs__colors">
        <div class="ocs__field">
            <label class="ocs__label" for="customPage">Background</label>
            <input class="sl-prefs__color" type="color" id="customPage" data-custom-color="page">
        </div>
        <div class="ocs__field">
            <label class="ocs__label" for="customText">Text</label>
            <input class="sl-prefs__color" type="color" id="customText" data-custom-color="text">
        </div>
        <div class="ocs__field">
            <label class="ocs__label" for="customAccent">Accent</label>
            <input class="sl-prefs__color" type="color" id="customAccent" data-custom-color="accent">
        </div>
    </div>
    <div class="ocs__field">
        <label class="ocs__label" for="customThemeName">Theme name</label>
        <div class="ocs__links">
            <input class="ocs__input medium" type="text" id="customThemeName" maxlength="40" placeholder="e.g. Calm evening">
            <button type="button" class="ocs__btn medium accent" id="saveCustomThemeBtn">Save as my theme</button>
        </div>
    </div>
    <ul class="sl-prefs__saved" id="savedThemeList"></ul>
    <p class="sl-note" id="savedThemeEmpty">No saved themes yet.</p>
</section>

<section class="ocs__card" aria-labelledby="readAloudTitle">
    <h2 class="ocs__section-title" id="readAloudTitle">Read Aloud</h2>
    <p class="sl-note" id="readAloudUnsupported" hidden>This browser can't read pages aloud.</p>
    <div class="ocs__grid--col2" id="readAloudFields">
        <div class="ocs__field">
            <span class="ocs__label">Read aloud button</span>
            <label class="ocs__toggle">
                <input class="ocs__toggle-input" type="checkbox" id="prefReadAloud" name="readAloud">
                <span class="ocs__toggle-track"></span>
                <span class="ocs__toggle-label">Show on every Shoreline page</span>
            </label>
            <small>Reads the text you select, or the whole page when nothing is selected.</small>
        </div>
        <div class="ocs__field">
            <label class="ocs__label" for="prefVoice">Voice</label>
            <select class="ocs__input medium" id="prefVoice" name="voice"></select>
        </div>
        <div class="ocs__field">
            <label class="ocs__label" for="prefRate">Speed <output id="prefRateValue" for="prefRate"></output></label>
            <input type="range" id="prefRate" name="rate">
        </div>
        <div class="ocs__field">
            <label class="ocs__label" for="prefPitch">Pitch <output id="prefPitchValue" for="prefPitch"></output></label>
            <input type="range" id="prefPitch" name="pitch">
        </div>
    </div>
    <button type="button" class="ocs__btn medium accent" id="testVoiceBtn">Test voice</button>
</section>

<div class="ocs__links sl-prefs__actions">
    <p id="preferencesStatus" class="sl-note" role="status"></p>
    <button type="button" class="ocs__btn medium accent" id="resetPreferencesBtn">Reset</button>
    <button type="submit" class="ocs__btn medium accent fill">Save changes</button>
</div>
</form>
<!-- markdownlint-enable MD033 -->

<script type="module">
import { initPreferencesPage } from '{{ site.baseurl }}/assets/js/shoreline/preferences.js';
initPreferencesPage();
</script>
