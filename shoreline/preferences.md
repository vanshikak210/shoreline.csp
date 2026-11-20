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

<form class="ocs__card sl-form" id="preferencesForm" aria-labelledby="preferencesTitle" hidden>
    <div class="ocs__card-header">
        <h2 class="ocs__section-title" id="preferencesTitle">Language &amp; Look</h2>
        <div class="ocs__links">
            <p id="preferencesStatus" class="sl-note" role="status"></p>
            <button type="button" class="ocs__btn medium accent" id="resetPreferencesBtn">Reset</button>
            <button type="submit" class="ocs__btn medium accent fill">Save changes</button>
        </div>
    </div>
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
</form>
<!-- markdownlint-enable MD033 -->

<script type="module">
import { initPreferencesPage } from '{{ site.baseurl }}/assets/js/shoreline/preferences.js';
initPreferencesPage();
</script>
