import { pythonURI } from '../api/config.js';

const CHOICES = ['volunteer', 'donate'];

export function initGetInvolved(section, request = fetch) {
  if (!section) return;
  const elements = Object.fromEntries(['state', 'message', 'volunteer', 'donate']
    .map(name => [name, section.querySelector(`#get-involved-${name}`)]));
  function busy(value) {
    elements.volunteer.disabled = value;
    elements.donate.disabled = value;
  }
  function render(interest) {
    for (const choice of CHOICES) {
      elements[choice].dataset.selected = String(choice === interest);
    }
    elements.state.textContent = interest === 'volunteer' ? "You're signed up to volunteer with us."
      : interest === 'donate' ? "You're signed up to donate."
      : "Tell us how you'd like to help, and we'll point you in the right direction.";
    busy(false);
  }
  async function api(method, body) {
    const response = await request(`${pythonURI}/api/user/interest`, {
      method, credentials: 'include', cache: 'no-store',
      headers: { 'Content-Type': 'application/json', 'X-Origin': 'client' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401) throw new Error("Sign in to save how you'd like to help.");
      throw new Error(data?.error || 'Unable to save your answer. Try again.');
    }
    return data;
  }
  for (const choice of CHOICES) {
    elements[choice].addEventListener('click', async () => {
      busy(true);
      elements.message.textContent = '';
      try {
        const data = await api('PUT', { interest: choice });
        render(data.interest ?? choice);
        elements.message.textContent = 'Saved — thank you!';
      } catch (error) { elements.message.textContent = error.message; busy(false); }
    });
  }
  busy(true);
  return api('GET').then(data => render(data.interest))
    .catch(() => { render(null); });
}
