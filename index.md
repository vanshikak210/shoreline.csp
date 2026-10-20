---
layout: opencs
title: Shoreline Community Services
description: Helping our neighbors in the Central Beach Area of San Diego.
hide: true
---
<!-- markdownlint-disable MD033 -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Asap:wght@400;500;600;700&family=Roboto:wght@400;500&display=swap">

<div class="shoreline-site">

<header class="sl-header">
    <div class="sl-container">
        <a class="sl-logo" href="#top">
            <span class="sl-logo__sun" aria-hidden="true"></span>
            <span>
                <span class="sl-logo__name">Shoreline</span><br>
                <span class="sl-logo__tagline">Community Services</span>
            </span>
        </a>
        <nav class="ocs__links sl-nav" aria-label="Shoreline sections">
            <a href="#impact">Our Impact</a>
            <a href="#need-help">Get Help</a>
            <a href="#volunteer">Volunteer</a>
            <a href="#donate">Donate</a>
        </nav>
        <a class="ocs__btn medium accent fill" href="#donate">Donate Now</a>
    </div>
</header>

<section class="sl-hero" id="top">
    <div class="sl-container">
        <h1>Everyone deserves a place to live.</h1>
        <p>We help unsheltered individuals and families in Pacific Beach, Mission Beach, and La Jolla find shelter, food, and support.</p>
        <div class="ocs__links">
            <a class="ocs__btn large alert-red fill" href="#need-help">I Need Help</a>
            <a class="ocs__btn large accent fill" href="#volunteer">Volunteer</a>
            <a class="ocs__btn large accent" href="#donate">Donate</a>
        </div>
    </div>
</section>

<section class="sl-section sl-section--teal">
    <div class="sl-container sl-section__intro">
        <h2>What Do We Do?</h2>
        <p class="sl-section__lead">We bring neighbors together so the Central Beach Area is safe and welcoming for everyone.</p>
        <p>Shoreline connects our most vulnerable neighbors with the shelter, services, and community support they need, with compassion and dignity.</p>
    </div>
</section>

<section class="sl-section" id="impact">
    <div class="sl-container">
        <h2>Our Impact</h2>
        <p class="sl-section__intro">See how your community is making a difference.</p>

        <div class="ocs__links">
            <button class="ocs__btn small pill accent fill" type="button">Last 7 days</button>
            <button class="ocs__btn small pill" type="button">Last 30 days</button>
            <button class="ocs__btn small pill" type="button">Last year</button>
        </div>

        <div class="ocs__grid ocs__grid--standard cols-4">
            <div class="ocs__grid-cell ocs__grid-cell--accent"><h3>—</h3>People helped</div>
            <div class="ocs__grid-cell ocs__grid-cell--accent"><h3>—</h3>Meals served</div>
            <div class="ocs__grid-cell ocs__grid-cell--accent"><h3>—</h3>Nights of shelter</div>
            <div class="ocs__grid-cell ocs__grid-cell--accent"><h3>—</h3>Volunteer hours</div>
        </div>

        <div class="ocs__grid ocs__grid--standard cols-2">
            <div class="ocs__grid-cell ocs__grid-cell--wide ocs__grid-cell--muted">
                Graph of people helped over the past year: coming soon
            </div>
        </div>
        <p class="sl-note">Real numbers coming once we have Shoreline's data.</p>
    </div>
</section>

<section class="sl-section sl-section--green">
    <div class="sl-container">
        <h2>How Can We Help You Today?</h2>
        <p class="sl-section__intro">Whether you need support or want to give it, start here.</p>

        <div class="ocs__grid ocs__grid--card cols-3">
            <div class="ocs__grid-cell" id="need-help">
                <h3>Need Help?</h3>
                <p>Find the nearest shelter, get directions, and reach our outreach team.</p>
                <a class="ocs__btn medium alert-red fill" href="#need-help">Find Shelter</a>
            </div>
            <div class="ocs__grid-cell" id="volunteer">
                <h3>Volunteer</h3>
                <p>See where help is needed most and pick a shift that works for you.</p>
                <a class="ocs__btn medium accent fill" href="#volunteer">Pick a Shift</a>
            </div>
            <div class="ocs__grid-cell" id="donate">
                <h3>Donate</h3>
                <p>Give money and see what it does, like <em>$50 = 1 meal + supplies</em>, or donate the items local shelters need right now.</p>
                <a class="ocs__btn medium accent fill" href="#donate">Give Today</a>
            </div>
        </div>
    </div>
</section>

<section class="sl-section sl-section--emergency">
    <div class="sl-container">
        <div class="ocs__grid ocs__grid--standard cols-2">
            <div class="ocs__grid-cell ocs__grid-cell--header">In an Emergency</div>
            <div class="ocs__grid-cell">
                <h3>Call 911</h3>
                If you or someone near you is in danger.
            </div>
            <div class="ocs__grid-cell">
                <h3>Call 2-1-1 San Diego</h3>
                Free, 24/7 help finding shelter, food, and other services.
            </div>
        </div>
    </div>
</section>

<footer class="sl-footer">
    <div class="sl-container">
        <p>A student redesign project for <a href="https://shorelinecs.org">Shoreline Community Services</a>. This is not the official Shoreline website.</p>
        <p><a href="{{ '/capstone/shoreline-volunteer/' | relative_url }}">About this project</a></p>
    </div>
</footer>

</div>
<!-- markdownlint-enable MD033 -->
