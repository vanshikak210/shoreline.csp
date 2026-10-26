import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../assets/js/profile/get-involved.js', import.meta.url), 'utf8');
const { initGetInvolved } = await import('data:text/javascript,' + encodeURIComponent(
  source.replace("import { pythonURI } from '../api/config.js';", "const pythonURI = 'http://localhost:8587';")));

function fixture() {
  const elements = Object.fromEntries(['state', 'message', 'volunteer', 'donate'].map(name => [name,
    { dataset: {}, disabled: false, textContent: '', listeners: {}, addEventListener(event, listener) { this.listeners[event] = listener; } }]));
  return { elements, section: { querySelector: selector => elements[selector.replace('#get-involved-', '')] } };
}

test('loads the saved answer and highlights the matching choice', async () => {
  const { elements, section } = fixture();
  await initGetInvolved(section, async () => ({ ok: true, status: 200, json: async () => ({ interest: 'volunteer' }) }));
  assert.equal(elements.volunteer.dataset.selected, 'true');
  assert.equal(elements.donate.dataset.selected, 'false');
  assert.equal(elements.state.textContent, "You're signed up to volunteer with us.");
  assert.equal(elements.volunteer.disabled, false);
});

test('no saved answer yet prompts the question without selecting either choice', async () => {
  const { elements, section } = fixture();
  await initGetInvolved(section, async () => ({ ok: true, status: 200, json: async () => ({ interest: null }) }));
  assert.equal(elements.volunteer.dataset.selected, 'false');
  assert.equal(elements.donate.dataset.selected, 'false');
  assert.match(elements.state.textContent, /Tell us how you'd like to help/);
});

test('picking donate saves it and updates the selected state', async () => {
  const { elements, section } = fixture();
  const calls = [];
  const request = async (url, options) => {
    calls.push(options);
    return { ok: true, status: 200, json: async () => ({ interest: options.method === 'PUT' ? 'donate' : null }) };
  };
  await initGetInvolved(section, request);
  await elements.donate.listeners.click();
  assert.equal(elements.donate.dataset.selected, 'true');
  assert.equal(elements.volunteer.dataset.selected, 'false');
  assert.equal(elements.message.textContent, 'Saved — thank you!');
  assert.deepEqual(JSON.parse(calls[1].body), { interest: 'donate' });
  assert.equal(calls[1].credentials, 'include');
  assert.equal(calls[1].headers['X-Origin'], 'client');
});

test('a failed save surfaces the error and re-enables the buttons', async () => {
  const { elements, section } = fixture();
  const request = async (url, options) => options.method === 'GET'
    ? { ok: true, status: 200, json: async () => ({ interest: null }) }
    : { ok: false, status: 403, json: async () => ({ error: 'Not allowed' }) };
  await initGetInvolved(section, request);
  await elements.volunteer.listeners.click();
  assert.equal(elements.message.textContent, 'Not allowed');
  assert.equal(elements.volunteer.disabled, false);
  assert.equal(elements.volunteer.dataset.selected, 'false');
});

test('not signed in reports a clear message instead of a raw auth error', async () => {
  const { elements, section } = fixture();
  const request = async (url, options) => options.method === 'GET'
    ? { ok: true, status: 200, json: async () => ({ interest: null }) }
    : { ok: false, status: 401, json: async () => ({}) };
  await initGetInvolved(section, request);
  await elements.donate.listeners.click();
  assert.equal(elements.message.textContent, "Sign in to save how you'd like to help.");
});
