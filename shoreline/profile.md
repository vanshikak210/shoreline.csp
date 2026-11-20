---
layout: shoreline-account
account_tab: profile
title: My Profile | Shoreline Community Services
permalink: /shoreline/profile
search_exclude: true
show_reading_time: false
custom_header: true
---
{%- assign p = site.data.shoreline_pages.profile -%}
<!-- markdownlint-disable MD033 -->
<header class="sl-account__head">
    <h1 id="profileGreeting">{{ p.title }}</h1>
    <p>{{ p.lead }}</p>
</header>

<section class="ocs__card" id="profileSignedOut" hidden>
    <h2 class="ocs__section-title">Sign in to see your profile</h2>
    <p>Your profile and volunteer hours are saved to your account.</p>
    <a class="ocs__btn medium accent fill" href="{{ '/shoreline-login' | relative_url }}">Sign In</a>
</section>

<div id="profileApp" hidden>

<!-- Who you are, and what you've done so far -->
<section class="ocs__card" aria-labelledby="cardName">
    <div class="ocs__grid--col2">
        <div class="ocs__keypoint">
            <abbr class="ocs__avatar sl-account__avatar" id="cardAvatar" title=""></abbr>
            <div>
                <h2 class="ocs__hub-card-title" id="cardName"></h2>
                <p class="sl-note" id="cardMeta"></p>
                <p id="cardBio"></p>
                <div class="ocs__links sl-account__pills" id="cardInterests"></div>
            </div>
        </div>
        <div>
            <h3 class="ocs__section-title">My Impact</h3>
            <ul class="sl-account__facts">
                <li><strong id="statHours">0</strong> Hours volunteered</li>
                <li><strong id="statShifts">0</strong> Shifts logged</li>
                <li><strong id="statChoice">—</strong> How I'm helping</li>
            </ul>
        </div>
    </div>
</section>

<!-- Details: the fields the Save button covers -->
<form class="ocs__card sl-form" id="profileForm" aria-labelledby="profileEditTitle">
    <div class="ocs__card-header">
        <h2 class="ocs__section-title" id="profileEditTitle">Details</h2>
        <div class="ocs__links">
            <p id="profileStatus" class="sl-note" role="status"></p>
            <button type="submit" class="ocs__btn medium accent fill">Save changes</button>
        </div>
    </div>
    <div class="ocs__grid--col2">
        <div class="ocs__field">
            <label class="ocs__label" for="profileName">Name</label>
            <input class="ocs__input medium" id="profileName" name="name" minlength="2" maxlength="80" required>
        </div>
        <div class="ocs__field">
            <label class="ocs__label" for="profileEmail">Email</label>
            <input class="ocs__input medium" type="email" id="profileEmail" name="email" maxlength="120">
        </div>
        <div class="ocs__field">
            <label class="ocs__label" for="profilePhone">Phone</label>
            <input class="ocs__input medium" type="tel" id="profilePhone" name="phone" maxlength="30">
        </div>
        <div class="ocs__field">
            <label class="ocs__label" for="profileChoice">How I want to help</label>
            <select class="ocs__input medium" id="profileChoice" name="choice">
                <option value="">Not chosen yet</option>
                {%- for c in p.choices %}
                <option value="{{ c.value }}">{{ c.label }}</option>
                {%- endfor %}
            </select>
        </div>
        <div class="ocs__field">
            <label class="ocs__label" for="profileNeighborhood">Neighborhood</label>
            <select class="ocs__input medium" id="profileNeighborhood" name="neighborhood">
                <option value="">Choose one</option>
                {%- for n in p.neighborhoods %}
                <option>{{ n }}</option>
                {%- endfor %}
            </select>
        </div>
        <div class="ocs__field">
            <label class="ocs__label" for="profileAvailability">Availability</label>
            <select class="ocs__input medium" id="profileAvailability" name="availability">
                <option value="">Choose one</option>
                {%- for a in p.availability %}
                <option>{{ a }}</option>
                {%- endfor %}
            </select>
        </div>
    </div>
    <div class="ocs__field">
        <span class="ocs__label">Interests</span>
        <div class="ocs__links">
            {%- for i in p.interests %}
            <label class="ocs__toggle">
                <input class="ocs__toggle-input" type="checkbox" name="interests" value="{{ i }}">
                <span class="ocs__toggle-track"></span>
                <span class="ocs__toggle-label">{{ i }}</span>
            </label>
            {%- endfor %}
        </div>
    </div>
    <div class="ocs__field">
        <label class="ocs__label" for="profileBio">About me</label>
        <textarea class="ocs__input" id="profileBio" name="bio" rows="3" maxlength="500"></textarea>
        <small>Up to 500 characters.</small>
    </div>
</form>

<!-- Volunteer hours: adding or removing an entry saves right away -->
<section class="ocs__card" aria-labelledby="hoursTitle">
    <div class="ocs__card-header">
        <h2 class="ocs__section-title" id="hoursTitle">Volunteer Hours</h2>
    </div>
    <form id="hoursForm" class="ocs__grid--col2 sl-form">
        <div class="ocs__field">
            <label class="ocs__label" for="hoursDate">Date</label>
            <input class="ocs__input medium" type="date" id="hoursDate" name="date" required>
        </div>
        <div class="ocs__field">
            <label class="ocs__label" for="hoursActivity">Activity</label>
            <select class="ocs__input medium" id="hoursActivity" name="activity" required>
                {%- for a in p.activities %}
                <option>{{ a }}</option>
                {%- endfor %}
            </select>
        </div>
        <div class="ocs__field">
            <label class="ocs__label" for="hoursAmount">Hours</label>
            <input class="ocs__input medium" type="number" id="hoursAmount" name="hours" min="0.25" max="24" step="0.25" value="1" required>
        </div>
        <div class="ocs__field">
            <label class="ocs__label" for="hoursNotes">Notes</label>
            <input class="ocs__input medium" id="hoursNotes" name="notes" maxlength="200" placeholder="Where / what you did">
        </div>
        <div class="ocs__links">
            <button type="submit" class="ocs__btn medium accent fill">Add Hours</button>
            <p id="hoursStatus" class="sl-note" role="status"></p>
        </div>
    </form>

    <div class="ocs__table-wrap">
        <table class="ocs__table">
            <thead>
                <tr><th>Date</th><th>Activity</th><th>Hours</th><th>Notes</th><th></th></tr>
            </thead>
            <tbody id="hoursRows"></tbody>
        </table>
    </div>
    <p id="hoursEmpty" class="sl-note">No hours logged yet.</p>
</section>

</div>

<p id="profileStorageNote" class="sl-note"></p>
<!-- markdownlint-enable MD033 -->

<script type="module">
import { initProfilePage } from '{{ site.baseurl }}/assets/js/shoreline/profile.js';
initProfilePage();
</script>
