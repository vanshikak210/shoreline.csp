---
layout: opencs
title: My Profile | Shoreline Community Services
permalink: /shoreline/profile
search_exclude: true
show_reading_time: false
custom_header: true
---
{%- assign p = site.data.shoreline_pages.profile -%}
<!-- markdownlint-disable MD033 -->
<div class="shoreline-site">

{% include shoreline/header.html %}

<section class="sl-hero sl-hero--short">
    <div class="sl-container">
        <h1 id="profileGreeting">{{ p.title }}</h1>
        <p>{{ p.lead }}</p>
    </div>
</section>

<section class="sl-section" id="profileSignedOut" hidden>
    <div class="sl-container">
        <h2>Sign in to see your profile</h2>
        <p class="sl-section__intro">Your profile and volunteer hours are saved to your account.</p>
        <a class="ocs__btn medium accent fill" href="{{ '/shoreline-login' | relative_url }}">Sign In</a>
    </div>
</section>

<div id="profileApp" hidden>

<section class="sl-section sl-section--teal">
    <div class="sl-container">
        <h2>My Impact</h2>
        <div class="ocs__grid ocs__grid--standard cols-3">
            <div class="ocs__grid-cell ocs__grid-cell--accent"><h3 id="statHours">0</h3>Hours volunteered</div>
            <div class="ocs__grid-cell ocs__grid-cell--accent"><h3 id="statShifts">0</h3>Shifts logged</div>
            <div class="ocs__grid-cell ocs__grid-cell--accent"><h3 id="statChoice">—</h3>How I'm helping</div>
        </div>
    </div>
</section>

<section class="sl-section">
    <div class="sl-container">
        <h2>My Details</h2>
        <form id="profileForm" class="ocs__grid ocs__grid--standard cols-2 sl-form">
            <div class="ocs__grid-cell ocs__field">
                <label class="ocs__label" for="profileName">Name</label>
                <input class="ocs__input medium" id="profileName" name="name" minlength="2" maxlength="80" required>
            </div>
            <div class="ocs__grid-cell ocs__field">
                <label class="ocs__label" for="profileEmail">Email</label>
                <input class="ocs__input medium" type="email" id="profileEmail" name="email" maxlength="120">
            </div>
            <div class="ocs__grid-cell ocs__field">
                <label class="ocs__label" for="profilePhone">Phone</label>
                <input class="ocs__input medium" type="tel" id="profilePhone" name="phone" maxlength="30">
            </div>
            <div class="ocs__grid-cell ocs__field">
                <label class="ocs__label" for="profileChoice">How I want to help</label>
                <select class="ocs__input medium" id="profileChoice" name="choice">
                    <option value="">Not chosen yet</option>
                    {%- for c in p.choices %}
                    <option value="{{ c.value }}">{{ c.label }}</option>
                    {%- endfor %}
                </select>
            </div>
            <div class="ocs__grid-cell ocs__field">
                <label class="ocs__label" for="profileNeighborhood">Neighborhood</label>
                <select class="ocs__input medium" id="profileNeighborhood" name="neighborhood">
                    <option value="">Choose one</option>
                    {%- for n in p.neighborhoods %}
                    <option>{{ n }}</option>
                    {%- endfor %}
                </select>
            </div>
            <div class="ocs__grid-cell ocs__field">
                <label class="ocs__label" for="profileAvailability">Availability</label>
                <select class="ocs__input medium" id="profileAvailability" name="availability">
                    <option value="">Choose one</option>
                    {%- for a in p.availability %}
                    <option>{{ a }}</option>
                    {%- endfor %}
                </select>
            </div>
            <div class="ocs__grid-cell ocs__grid-cell--wide ocs__field">
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
            <div class="ocs__grid-cell ocs__grid-cell--wide ocs__field">
                <label class="ocs__label" for="profileBio">About me</label>
                <textarea class="ocs__input" id="profileBio" name="bio" rows="3" maxlength="500"></textarea>
                <small>Up to 500 characters.</small>
            </div>
            <div class="ocs__grid-cell ocs__grid-cell--wide">
                <button type="submit" class="ocs__btn medium accent fill">Save Profile</button>
                <p id="profileStatus" class="sl-note" role="status"></p>
            </div>
        </form>
    </div>
</section>

<section class="sl-section sl-section--green">
    <div class="sl-container">
        <h2>Log Volunteer Hours</h2>
        <form id="hoursForm" class="ocs__grid ocs__grid--standard cols-4 sl-form">
            <div class="ocs__grid-cell ocs__field">
                <label class="ocs__label" for="hoursDate">Date</label>
                <input class="ocs__input medium" type="date" id="hoursDate" name="date" required>
            </div>
            <div class="ocs__grid-cell ocs__field">
                <label class="ocs__label" for="hoursActivity">Activity</label>
                <select class="ocs__input medium" id="hoursActivity" name="activity" required>
                    {%- for a in p.activities %}
                    <option>{{ a }}</option>
                    {%- endfor %}
                </select>
            </div>
            <div class="ocs__grid-cell ocs__field">
                <label class="ocs__label" for="hoursAmount">Hours</label>
                <input class="ocs__input medium" type="number" id="hoursAmount" name="hours" min="0.25" max="24" step="0.25" value="1" required>
            </div>
            <div class="ocs__grid-cell ocs__field">
                <label class="ocs__label" for="hoursNotes">Notes</label>
                <input class="ocs__input medium" id="hoursNotes" name="notes" maxlength="200" placeholder="Where / what you did">
            </div>
            <div class="ocs__grid-cell ocs__grid-cell--wide">
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
    </div>
</section>

</div>

<section class="sl-section">
    <div class="sl-container">
        <p id="profileStorageNote" class="sl-note"></p>
    </div>
</section>

{% include shoreline/footer.html %}

</div>
<!-- markdownlint-enable MD033 -->

<script type="module">
import { initProfilePage } from '{{ site.baseurl }}/assets/js/shoreline/profile.js';
initProfilePage();
</script>
