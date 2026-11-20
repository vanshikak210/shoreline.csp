---
layout: opencs
title: Community Analytics | Shoreline Community Services
permalink: /shoreline/analytics
search_exclude: true
show_reading_time: false
custom_header: true
---
{%- assign p = site.data.shoreline_pages.analytics -%}
<!-- markdownlint-disable MD033 -->
<div class="shoreline-site">

{% include shoreline/header.html %}

<section class="sl-hero sl-hero--short sl-hero--profile">
    <div class="sl-container">
        <h1>{{ p.title }}</h1>
        <p>{{ p.lead }}</p>
    </div>
</section>

{% include shoreline/account-tabs.html active="analytics" %}

<section class="sl-section" id="analyticsSignedOut" hidden>
    <div class="sl-container">
        <h2>Sign in with an admin account</h2>
        <a class="ocs__btn medium accent fill" href="{{ '/shoreline-login' | relative_url }}">Sign In</a>
    </div>
</section>

<section class="sl-section" id="analyticsNotAdmin" hidden>
    <div class="sl-container">
        <h2>Admins only</h2>
        <p class="sl-section__intro">Community analytics are only available to Shoreline admin accounts.</p>
        <a class="ocs__btn medium accent fill" href="{{ '/shoreline/profile' | relative_url }}">Back to My Profile</a>
    </div>
</section>

<div id="analyticsApp" hidden>

<section class="sl-section sl-section--teal">
    <div class="sl-container">
        <h2>At a Glance</h2>
        <div class="ocs__grid ocs__grid--standard cols-4 sl-analytics-stats">
            <div class="ocs__grid-cell ocs__grid-cell--accent"><h3 id="statMembers">0</h3>Community members</div>
            <div class="ocs__grid-cell ocs__grid-cell--accent"><h3 id="statTotalHours">0</h3>Hours volunteered</div>
            <div class="ocs__grid-cell ocs__grid-cell--accent"><h3 id="statShifts">0</h3>Shifts logged</div>
            <div class="ocs__grid-cell ocs__grid-cell--accent"><h3 id="statVolunteers">0</h3>Active volunteers</div>
        </div>
    </div>
</section>

<section class="sl-section">
    <div class="sl-container">
        <div class="ocs__grid ocs__grid--standard cols-2 sl-analytics-grid">
            <div class="ocs__grid-cell">
                <h2>Sign-ups</h2>
                <div class="sl-bars" id="signupBars"></div>
                <p class="sl-note" id="signupNote"></p>
            </div>
            <div class="ocs__grid-cell">
                <h2>How People Want to Help</h2>
                <div class="sl-bars" id="surveyBars"></div>
                <p class="sl-note" id="surveyNote"></p>
            </div>
            <div class="ocs__grid-cell">
                <h2>Hours by Activity</h2>
                <div class="sl-bars" id="activityBars"></div>
            </div>
            <div class="ocs__grid-cell">
                <h2>Top Volunteers</h2>
                <div class="ocs__table-wrap">
                    <table class="ocs__table">
                        <thead><tr><th>Name</th><th>Hours</th><th>Shifts</th></tr></thead>
                        <tbody id="topVolunteerRows"></tbody>
                    </table>
                </div>
            </div>
            <div class="ocs__grid-cell">
                <h2>Neighborhoods</h2>
                <div class="sl-bars" id="neighborhoodBars"></div>
            </div>
            <div class="ocs__grid-cell">
                <h2>Interests</h2>
                <div class="sl-bars" id="interestBars"></div>
            </div>
        </div>
    </div>
</section>

</div>

<section class="sl-section">
    <div class="sl-container">
        <p id="analyticsStatus" class="sl-note" role="status"></p>
    </div>
</section>

{% include shoreline/footer.html %}

</div>
<!-- markdownlint-enable MD033 -->

<script type="module">
import { initAnalyticsPage } from '{{ site.baseurl }}/assets/js/shoreline/analytics.js';
initAnalyticsPage();
</script>
