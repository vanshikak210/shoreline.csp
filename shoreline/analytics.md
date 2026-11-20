---
layout: shoreline-account
account_tab: analytics
title: Community Analytics | Shoreline Community Services
permalink: /shoreline/analytics
search_exclude: true
show_reading_time: false
custom_header: true
---
{%- assign p = site.data.shoreline_pages.analytics -%}
<!-- markdownlint-disable MD033 -->
<header class="sl-account__head">
    <h1>{{ p.title }}</h1>
    <p>{{ p.lead }}</p>
</header>

<section class="ocs__card" id="analyticsSignedOut" hidden>
    <h2 class="ocs__section-title">Sign in with an admin account</h2>
    <a class="ocs__btn medium accent fill" href="{{ '/shoreline-login' | relative_url }}">Sign In</a>
</section>

<section class="ocs__card" id="analyticsNotAdmin" hidden>
    <h2 class="ocs__section-title">Admins only</h2>
    <p>Community analytics are only available to Shoreline admin accounts.</p>
    <a class="ocs__btn medium accent fill" href="{{ '/shoreline/profile' | relative_url }}">Back to My Profile</a>
</section>

<div id="analyticsApp" hidden>

<section class="ocs__card" aria-labelledby="glanceTitle">
    <h2 class="ocs__section-title" id="glanceTitle">At a Glance</h2>
    <div class="sl-account__stats">
        <div><strong id="statMembers">0</strong>Community members</div>
        <div><strong id="statTotalHours">0</strong>Hours volunteered</div>
        <div><strong id="statShifts">0</strong>Shifts logged</div>
        <div><strong id="statVolunteers">0</strong>Active volunteers</div>
    </div>
</section>

<div class="ocs__grid--col2 sl-account__cards">
    <section class="ocs__card" aria-labelledby="signupTitle">
        <h2 class="ocs__section-title" id="signupTitle">Sign-ups</h2>
        <div class="sl-bars" id="signupBars"></div>
        <p class="sl-note" id="signupNote"></p>
    </section>
    <section class="ocs__card" aria-labelledby="surveyTitle">
        <h2 class="ocs__section-title" id="surveyTitle">How People Want to Help</h2>
        <div class="sl-bars" id="surveyBars"></div>
        <p class="sl-note" id="surveyNote"></p>
    </section>
    <section class="ocs__card" aria-labelledby="activityTitle">
        <h2 class="ocs__section-title" id="activityTitle">Hours by Activity</h2>
        <div class="sl-bars" id="activityBars"></div>
    </section>
    <section class="ocs__card" aria-labelledby="topTitle">
        <h2 class="ocs__section-title" id="topTitle">Top Volunteers</h2>
        <div class="ocs__table-wrap">
            <table class="ocs__table">
                <thead><tr><th>Name</th><th>Hours</th><th>Shifts</th></tr></thead>
                <tbody id="topVolunteerRows"></tbody>
            </table>
        </div>
    </section>
    <section class="ocs__card" aria-labelledby="neighborhoodTitle">
        <h2 class="ocs__section-title" id="neighborhoodTitle">Neighborhoods</h2>
        <div class="sl-bars" id="neighborhoodBars"></div>
    </section>
    <section class="ocs__card" aria-labelledby="interestTitle">
        <h2 class="ocs__section-title" id="interestTitle">Interests</h2>
        <div class="sl-bars" id="interestBars"></div>
    </section>
</div>

</div>

<p id="analyticsStatus" class="sl-note" role="status"></p>
<!-- markdownlint-enable MD033 -->

<script type="module">
import { initAnalyticsPage } from '{{ site.baseurl }}/assets/js/shoreline/analytics.js';
initAnalyticsPage();
</script>
