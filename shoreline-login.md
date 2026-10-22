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
        <p class="sl-section__intro">What brings you to Shoreline today?</p>

        <div class="ocs__grid ocs__grid--card cols-2">
            <div class="ocs__grid-cell">
                <h3>Volunteer</h3>
                <p>See where help is needed most and pick a shift that works for you.</p>
                <a class="ocs__btn medium accent fill" href="{{ '/' | relative_url }}#volunteer">I Want to Volunteer</a>
            </div>
            <div class="ocs__grid-cell">
                <h3>Donate</h3>
                <p>Give money or the items local shelters need right now.</p>
                <a class="ocs__btn medium accent fill" href="{{ '/' | relative_url }}#donate">I Want to Donate</a>
            </div>
        </div>
    </div>
</section>

</div>
<!-- markdownlint-enable MD033 -->

<script>
// Front-end demo only: Shoreline has no account backend yet, so this just greets
// the visitor by name and routes them to the Volunteer/Donate sections below.
// The password is never stored or sent anywhere.
document.getElementById('shorelineLoginForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const name = document.getElementById('shorelineName').value.trim();

    document.getElementById('shoreline-login-form').hidden = true;
    const surveySection = document.getElementById('shoreline-login-survey');
    surveySection.hidden = false;
    document.getElementById('shorelineSurveyGreeting').textContent = name ? `Welcome, ${name}!` : 'Welcome!';
    surveySection.scrollIntoView({ behavior: 'smooth' });
});
</script>
