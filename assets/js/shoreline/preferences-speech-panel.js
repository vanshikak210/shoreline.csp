// Read Aloud card on /shoreline/preferences: the on/off switch, voice, speed and pitch.
// Voices come from this browser, so the list differs between devices.

import { SPEECH_RATE, SPEECH_PITCH } from './preferences-model.js';
import { speak, speechSupported } from './read-aloud.js';

const $ = id => document.getElementById(id);
const SAMPLE = 'This is how Shoreline pages will sound when they are read aloud.';

function setRange(input, { min, max, step }) {
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
}

function fillVoices(select, selected) {
    const voices = window.speechSynthesis.getVoices()
        .slice()
        .sort((a, b) => a.lang.localeCompare(b.lang) || a.name.localeCompare(b.name));
    select.innerHTML = '';
    select.add(new Option('Browser default (matches the page language)', ''));
    voices.forEach(voice => select.add(new Option(`${voice.name} (${voice.lang})`, voice.name)));
    select.value = selected;
    // A voice saved on another device may be missing here; the default is used instead.
    if (select.value !== selected) select.value = '';
}

export function createSpeechPanel({ getDraft, update }) {
    if (!speechSupported()) {
        $('readAloudUnsupported').hidden = false;
        $('readAloudFields').hidden = true;
        $('testVoiceBtn').hidden = true;
        return { render() {} };
    }

    setRange($('prefRate'), SPEECH_RATE);
    setRange($('prefPitch'), SPEECH_PITCH);
    fillVoices($('prefVoice'), getDraft().readAloud.voice);
    // Chrome loads its voices after the page does.
    window.speechSynthesis.addEventListener('voiceschanged', () => fillVoices($('prefVoice'), getDraft().readAloud.voice));

    const change = changes => update({ readAloud: { ...getDraft().readAloud, ...changes } });
    $('prefReadAloud').addEventListener('change', event => change({ enabled: event.target.checked }));
    $('prefListenButtons').addEventListener('change', event => change({ listenButtons: event.target.checked }));
    $('prefVoice').addEventListener('change', event => change({ voice: event.target.value }));
    $('prefRate').addEventListener('input', event => change({ rate: Number(event.target.value) }));
    $('prefPitch').addEventListener('input', event => change({ pitch: Number(event.target.value) }));
    $('testVoiceBtn').addEventListener('click', () => speak(SAMPLE, getDraft().readAloud));

    return {
        render({ readAloud }) {
            $('prefReadAloud').checked = readAloud.enabled;
            $('prefListenButtons').checked = readAloud.listenButtons;
            if ($('prefVoice').value !== readAloud.voice) $('prefVoice').value = readAloud.voice;
            $('prefRate').value = String(readAloud.rate);
            $('prefPitch').value = String(readAloud.pitch);
            $('prefRateValue').textContent = `${readAloud.rate}×`;
            $('prefPitchValue').textContent = `${readAloud.pitch}×`;
        },
    };
}
