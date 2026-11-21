// Read-aloud button on Shoreline pages (turned on in /shoreline/preferences).
// Reads the selected text, or the page's main content when nothing is selected,
// with the browser's speech synthesis. Nothing leaves the device.

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

/** Add, update or remove the floating Read aloud button to match the settings. */
export function mountReadAloud(settings) {
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
