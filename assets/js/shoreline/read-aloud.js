// Read aloud on Shoreline pages, set up in /shoreline/preferences:
// - a speaker button beside each heading reads that card or section (on by default);
// - an optional floating button reads the selected text, or the whole page.
// Uses the browser's speech synthesis, so nothing leaves the device.

import { speechChunks, pickVoice } from './read-aloud-model.js';

const BUTTON_ID = 'shorelineReadAloud';
const READ_LABEL = 'Read aloud';
const STOP_LABEL = 'Stop reading';

export function speechSupported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/** Main page text: account pages read their main column; other pages skip header and footer. */
function pageText() {
    const main = document.querySelector('.sl-account__main');
    if (main) return main.innerText;
    const site = document.querySelector('.shoreline-site');
    if (!site) return document.body.innerText;
    return [...site.children]
        .filter(el => !el.matches('.sl-header, .sl-footer, script, style, #' + BUTTON_ID))
        .map(el => el.innerText)
        .join('\n');
}

export function stopSpeaking() {
    if (speechSupported()) window.speechSynthesis.cancel();
}

/**
 * Speak text with the saved settings. `onDone` runs when it finishes or is stopped.
 * With no saved voice, the page language (set by Google Translate) picks the voice.
 */
export function speak(text, settings, onDone = () => {}) {
    if (!speechSupported()) return false;
    const synth = window.speechSynthesis;
    synth.cancel();
    const chunks = speechChunks(text);
    if (!chunks.length) { onDone(); return false; }
    const voice = pickVoice(synth.getVoices(), settings.voice);
    const lang = document.documentElement.getAttribute('lang') || 'en';
    chunks.forEach((chunk, index) => {
        const utterance = new SpeechSynthesisUtterance(chunk);
        if (voice) utterance.voice = voice;
        else utterance.lang = lang;
        utterance.rate = settings.rate;
        utterance.pitch = settings.pitch;
        if (index === chunks.length - 1) utterance.onend = onDone;
        utterance.onerror = onDone;
        synth.speak(utterance);
    });
    return true;
}

// ── Listen buttons: a speaker button beside each heading that reads the heading's block ──
const LISTEN_CLASS = 'sl-listen';
const HEADINGS = '.shoreline-site h1, .shoreline-site h2, .shoreline-site h3';
// Site chrome and the account menu are navigation, not content to listen to. Number tiles
// (.ocs__grid-cell--accent) are too small for a button; their section's button reads them.
const SKIP = '.sl-header, .sl-footer, .sl-account__sidebar, .sl-avatar, .ocs__grid-cell--accent';
// The block a heading introduces: its card, else its section or banner.
const BLOCKS = '.ocs__grid-cell, .ocs__card, .sl-account__head, .sl-section, .sl-hero, section';

const SPEAKER_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">'
    + '<path fill="currentColor" d="M3 9v6h4l5 4V5L7 9H3z"/>'
    + '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M15.5 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"/></svg>';
const STOP_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">'
    + '<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/></svg>';

let activeListenButton = null;

function setListening(button, listening) {
    const title = button.dataset.title;
    button.innerHTML = listening ? STOP_ICON : SPEAKER_ICON;
    button.setAttribute('aria-pressed', String(listening));
    button.setAttribute('aria-label', listening ? `Stop reading ${title}` : `Listen to ${title}`);
    button.title = listening ? 'Stop reading' : 'Listen';
}

function addListenButton(heading, settings) {
    const title = heading.textContent.trim();
    if (!title) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = LISTEN_CLASS;
    button.dataset.title = title;
    // Google Translate must not rewrite the icon-only button.
    button.setAttribute('translate', 'no');
    setListening(button, false);
    button.addEventListener('click', () => {
        const wasActive = activeListenButton === button;
        stopSpeaking();
        if (activeListenButton) setListening(activeListenButton, false);
        activeListenButton = null;
        if (wasActive) return;
        const block = heading.closest(BLOCKS) || heading.parentElement;
        // innerText at click time, so a translated page is read in its new language.
        const done = () => { setListening(button, false); if (activeListenButton === button) activeListenButton = null; };
        if (speak(block.innerText, button.settings, done)) {
            activeListenButton = button;
            setListening(button, true);
        }
    });
    button.settings = settings;
    heading.appendChild(button);
}

/** Add (or remove) listen buttons beside every content heading; safe to call again. */
export function mountListenButtons(settings) {
    const existing = document.querySelectorAll(`.${LISTEN_CLASS}`);
    if (!settings.listenButtons || !speechSupported()) {
        existing.forEach(button => button.remove());
        return;
    }
    existing.forEach(button => { button.settings = settings; });
    document.querySelectorAll(HEADINGS).forEach(heading => {
        if (heading.closest(SKIP) || heading.querySelector(`.${LISTEN_CLASS}`)) return;
        addListenButton(heading, settings);
    });
}

/** Add, update or remove the floating Read aloud button to match the settings. */
export function mountReadAloud(settings) {
    mountListenButtons(settings);
    let button = document.getElementById(BUTTON_ID);
    if (!settings.enabled || !speechSupported()) {
        if (button) { stopSpeaking(); button.remove(); }
        return;
    }
    if (!button) {
        button = document.createElement('button');
        button.type = 'button';
        button.id = BUTTON_ID;
        button.className = 'ocs__btn medium accent fill sl-read-aloud';
        (document.querySelector('.shoreline-site') || document.body).appendChild(button);
    }
    const setReading = reading => {
        button.textContent = reading ? STOP_LABEL : READ_LABEL;
        button.setAttribute('aria-pressed', String(reading));
    };
    setReading(window.speechSynthesis.speaking);
    button.onclick = () => {
        if (window.speechSynthesis.speaking) { stopSpeaking(); setReading(false); return; }
        const selected = window.getSelection()?.toString().trim();
        if (speak(selected || pageText(), settings, () => setReading(false))) setReading(true);
    };
}
