---
layout: opencs
title: Preferences | Shoreline Community Services
permalink: /shoreline/preferences
search_exclude: true
show_reading_time: false
custom_header: true
---
{%- assign p = site.data.shoreline_pages.preferences -%}
<!-- markdownlint-disable MD033 -->
<div class="shoreline-site">

{% include shoreline/header.html %}

<section class="sl-hero sl-hero--short sl-hero--profile">
    <div class="sl-container">
        <h1>{{ p.title }}</h1>
        <p>{{ p.lead }}</p>
    </div>
</section>

{% include shoreline/account-tabs.html active="preferences" %}

<section class="sl-section" id="preferencesSignedOut" hidden>
    <div class="sl-container">
        <h2>Sign in to set your preferences</h2>
        <a class="ocs__btn medium accent fill" href="{{ '/shoreline-login' | relative_url }}">Sign In</a>
    </div>
</section>

<section class="sl-section" id="preferencesApp" hidden>
    <div class="sl-container">
        <form id="preferencesForm" class="ocs__grid ocs__grid--standard cols-2 sl-form">
            <div class="ocs__grid-cell ocs__field">
                <h2>Language</h2>
                <label class="ocs__label" for="prefLanguage">Show the site in</label>
                <select class="ocs__input medium" id="prefLanguage" name="language"></select>
                <small>Translated automatically by Google Translate.</small>
            </div>
            <div class="ocs__grid-cell ocs__field">
                <h2>Look</h2>
                <span class="ocs__label">Text size</span>
                <div class="ocs__links" id="prefTextSize" role="radiogroup" aria-label="Text size"></div>
                <label class="ocs__toggle">
                    <input class="ocs__toggle-input" type="checkbox" id="prefHighContrast" name="highContrast">
                    <span class="ocs__toggle-track"></span>
                    <span class="ocs__toggle-label">High contrast</span>
                </label>
                <label class="ocs__toggle">
                    <input class="ocs__toggle-input" type="checkbox" id="prefReduceMotion" name="reduceMotion">
                    <span class="ocs__toggle-track"></span>
                    <span class="ocs__toggle-label">Reduce motion</span>
                </label>
            </div>
            <div class="ocs__grid-cell ocs__grid-cell--wide">
                <div class="ocs__links">
                    <button type="submit" class="ocs__btn medium accent fill">Save Preferences</button>
                    <button type="button" class="ocs__btn medium accent" id="resetPreferencesBtn">Reset to Defaults</button>
                </div>
                <p id="preferencesStatus" class="sl-note" role="status"></p>
            </div>
        </form>
    </div>
</section>

{% include shoreline/footer.html %}

</div>
<!-- markdownlint-enable MD033 -->

<script type="module">
import { initPreferencesPage } from '{{ site.baseurl }}/assets/js/shoreline/preferences.js';
initPreferencesPage();
</script>
