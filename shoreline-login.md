---
layout: opencs
title: Shoreline Login
permalink: /shoreline-login
search_exclude: true
show_reading_time: false
custom_header: true
---
<!-- markdownlint-disable MD033 -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Asap:wght@400;500;600;700&family=Roboto:wght@400;500&display=swap">

<div class="shoreline-site">

<header class="sl-header">
    <div class="sl-container">
        <a class="sl-logo" href="{{ '/' | relative_url }}">
            <span class="sl-logo__sun" aria-hidden="true"></span>
            <span>
                <span class="sl-logo__name">Shoreline</span><br>
                <span class="sl-logo__tagline">Community Services</span>
            </span>
        </a>
    </div>
</header>

<section class="sl-section" id="shoreline-login-form">
    <div class="sl-container">
        <h2>Sign In</h2>
        <p class="sl-section__intro">Tell us a bit about yourself so we can point you the right way.</p>

        <div class="ocs__grid ocs__grid--standard cols-1">
            <div class="ocs__grid-cell">
                <form id="shorelineLoginForm">
                    <p>
                        <input class="ocs__input medium" type="text" id="shorelineName" placeholder="Name" required>
                    </p>
                    <p>
                        <input class="ocs__input medium" type="email" id="shorelineEmail" placeholder="Email" required>
                    </p>
                    <p>
                        <input class="ocs__input medium" type="password" id="shorelinePassword" placeholder="Password" required>
                    </p>
                    <p>
                        <button type="submit" class="ocs__btn medium accent fill">Continue</button>
                    </p>
                </form>
            </div>
        </div>
    </div>
</section>

<section class="sl-section sl-section--green" id="shoreline-login-survey" hidden>
    <div class="sl-container">
        <h2 id="shorelineSurveyGreeting">Welcome!</h2>
        <p class="sl-section__intro">Do you want to donate, volunteer, or neither for now?</p>

        <div class="ocs__grid ocs__grid--card cols-3">
            <div class="ocs__grid-cell">
                <h3>Donate</h3>
                <p>Give money or the items local shelters need right now.</p>
                <button type="button" class="ocs__btn medium accent fill" data-choice="donate" data-redirect="{{ '/' | relative_url }}#donate">I Want to Donate</button>
            </div>
            <div class="ocs__grid-cell">
                <h3>Volunteer</h3>
                <p>See where help is needed most and pick a shift that works for you.</p>
                <button type="button" class="ocs__btn medium accent fill" data-choice="volunteer" data-redirect="{{ '/' | relative_url }}#volunteer">I Want to Volunteer</button>
            </div>
            <div class="ocs__grid-cell">
                <h3>None</h3>
                <p>Not ready to commit to either just yet? That's okay too.</p>
                <button type="button" class="ocs__btn medium accent" data-choice="none" data-redirect="{{ '/' | relative_url }}">Maybe Later</button>
            </div>
        </div>
        <p id="shorelineSurveyStatus" class="sl-note"></p>
    </div>
</section>

</div>
<!-- markdownlint-enable MD033 -->

<script type="module">
import { pythonURI, fetchOptions } from '{{ site.baseurl }}/assets/js/api/config.js';

// Shoreline has no account backend yet. The survey POSTs to a placeholder endpoint
// (/api/shoreline/survey) that does not exist on the Flask server yet; someone still
// needs to add that route server-side. The password is never sent to it - only the
// name/email collected on this page, plus the donate/volunteer/none choice.
let visitorName = '';
let visitorEmail = '';

document.getElementById('shorelineLoginForm').addEventListener('submit', function (event) {
    event.preventDefault();
    visitorName = document.getElementById('shorelineName').value.trim();
    visitorEmail = document.getElementById('shorelineEmail').value.trim();

    document.getElementById('shoreline-login-form').hidden = true;
    const surveySection = document.getElementById('shoreline-login-survey');
    surveySection.hidden = false;
    document.getElementById('shorelineSurveyGreeting').textContent = visitorName ? `Welcome, ${visitorName}!` : 'Welcome!';
    surveySection.scrollIntoView({ behavior: 'smooth' });
});

document.querySelectorAll('#shoreline-login-survey [data-choice]').forEach(button => {
    button.addEventListener('click', async () => {
        const statusEl = document.getElementById('shorelineSurveyStatus');
        statusEl.textContent = 'Saving...';

        try {
            const response = await fetch(`${pythonURI}/api/shoreline/survey`, {
                ...fetchOptions,
                method: 'POST',
                body: JSON.stringify({
                    name: visitorName,
                    email: visitorEmail,
                    choice: button.dataset.choice,
                }),
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
        } catch (error) {
            // Best-effort: still send the visitor on their way even if saving failed
            // (expected until the backend route exists).
            console.warn('Could not save survey choice:', error);
        }

        window.location.href = button.dataset.redirect;
    });
});
</script>
