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
        <span id="shorelineAuthArea"></span>
    </div>
</header>

<section class="sl-section" id="shoreline-login-form">
    <div class="sl-container">
        <h2 id="shorelineAuthTitle">Sign In</h2>
        <p class="sl-section__intro">Sign in so we can remember you and point you the right way.</p>

        <div class="ocs__links sl-auth-tabs" role="tablist">
            <button type="button" class="ocs__btn medium accent fill" data-tab="login" aria-selected="true">Sign In</button>
            <button type="button" class="ocs__btn medium accent" data-tab="signup" aria-selected="false">Create Account</button>
        </div>

        <div class="ocs__grid ocs__grid--standard cols-1">
            <div class="ocs__grid-cell">
                <form id="shorelineLoginForm" data-panel="login">
                    <p><input class="ocs__input medium" type="text" id="loginUid" placeholder="Username" autocomplete="username" required></p>
                    <p><input class="ocs__input medium" type="password" id="loginPassword" placeholder="Password" autocomplete="current-password" required></p>
                    <p><button type="submit" class="ocs__btn medium accent fill">Continue</button></p>
                </form>

                <form id="shorelineSignupForm" data-panel="signup" hidden>
                    <p><input class="ocs__input medium" type="text" id="signupName" placeholder="Full name" autocomplete="name" required></p>
                    <p><input class="ocs__input medium" type="text" id="signupUid" placeholder="Username" autocomplete="username" required></p>
                    <p><input class="ocs__input medium" type="email" id="signupEmail" placeholder="Email" autocomplete="email" required></p>
                    <p><input class="ocs__input medium" type="password" id="signupPassword" placeholder="Password" autocomplete="new-password" minlength="6" required></p>
                    <p><button type="submit" class="ocs__btn medium accent fill">Create Account</button></p>
                </form>

                <p id="shorelineAuthMessage" class="sl-note" role="alert"></p>
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
import {
    getShorelineUser, shorelineLogin, shorelineSignup, saveSurveyChoice, renderShorelineAuth, withSlowNotice
} from '{{ site.baseurl }}/assets/js/shoreline/auth.js';

const loginSection = document.getElementById('shoreline-login-form');
const surveySection = document.getElementById('shoreline-login-survey');
const messageEl = document.getElementById('shorelineAuthMessage');

function showSurvey(user) {
    loginSection.hidden = true;
    surveySection.hidden = false;
    document.getElementById('shorelineSurveyGreeting').textContent = user?.name ? `Welcome, ${user.name}!` : 'Welcome!';
    surveySection.scrollIntoView({ behavior: 'smooth' });
}

// The survey is only for new accounts: Create Account -> survey, Sign In -> home.
// "Update my choice" in the profile menu opens this page with ?update=1 to change it.
const wantsUpdate = new URLSearchParams(location.search).has('update');
const HOME = '{{ '/' | relative_url }}';

// Tabs: Sign In / Create Account
document.querySelectorAll('.sl-auth-tabs [data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
        const which = tab.dataset.tab;
        document.querySelectorAll('.sl-auth-tabs [data-tab]').forEach(t => {
            const on = t.dataset.tab === which;
            t.classList.toggle('fill', on);
            t.setAttribute('aria-selected', String(on));
        });
        document.querySelectorAll('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== which; });
        document.getElementById('shorelineAuthTitle').textContent = which === 'login' ? 'Sign In' : 'Create Account';
        messageEl.textContent = '';
    });
});

async function runAuth(form, action, showSurveyAfter) {
    const button = form.querySelector('button[type=submit]');
    messageEl.textContent = '';
    button.disabled = true;
    try {
        const user = await withSlowNotice(action(), () => {
            messageEl.textContent = 'Waking up the server, this can take up to a minute the first time...';
        });
        messageEl.textContent = '';
        if (!showSurveyAfter) {
            window.location.href = HOME;
            return;
        }
        await renderShorelineAuth(document.getElementById('shorelineAuthArea'));
        showSurvey(user);
    } catch (err) {
        messageEl.textContent = err.message;
    } finally {
        button.disabled = false;
    }
}

document.getElementById('shorelineLoginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    runAuth(e.target, () => shorelineLogin(
        document.getElementById('loginUid').value.trim(),
        document.getElementById('loginPassword').value,
    ), false);
});

document.getElementById('shorelineSignupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    runAuth(e.target, () => shorelineSignup({
        name: document.getElementById('signupName').value.trim(),
        uid: document.getElementById('signupUid').value.trim(),
        email: document.getElementById('signupEmail').value.trim(),
        password: document.getElementById('signupPassword').value,
    }), true);
});

// Survey -> Flask (/api/shoreline/survey), then on to the chosen section.
document.querySelectorAll('#shoreline-login-survey [data-choice]').forEach(button => {
    button.addEventListener('click', async () => {
        const statusEl = document.getElementById('shorelineSurveyStatus');
        statusEl.textContent = 'Saving...';
        try {
            await saveSurveyChoice(button.dataset.choice);
            statusEl.textContent = 'Saved!';
        } catch (err) {
            // Choice is kept in localStorage by saveSurveyChoice; don't trap the visitor here.
            console.warn('Shoreline survey not saved on server:', err);
            statusEl.textContent = 'Saved on this device (server unavailable).';
        }
        window.location.href = button.dataset.redirect;
    });
});

// Already signed in (JWT cookie still valid)? Skip the form entirely.
(async () => {
    const user = await getShorelineUser();
    renderShorelineAuth(document.getElementById('shorelineAuthArea'));
    if (!user) return;
    if (wantsUpdate) showSurvey(user);
    else window.location.href = HOME;
})();
</script>
