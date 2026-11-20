---
---
// Tab bar at the top of the Shoreline account pages (Profile, Preferences, Analytics).
// Same tabs as the avatar menu, from account-model.js, so the two never disagree.

import { baseurl } from '{{ site.baseurl }}/assets/js/api/config.js';
import { accountTabs } from '{{ site.baseurl }}/assets/js/shoreline/account-model.js';

/** Fill `el` with this user's tabs and mark `activeId` as the current page. */
export function renderAccountTabs(el, user, activeId) {
    if (!el || !user) return;
    el.innerHTML = accountTabs(user).map(tab => {
        const active = tab.id === activeId;
        return `<a class="ocs__btn medium accent${active ? ' fill' : ''}" href="${baseurl}${tab.path}"${active ? ' aria-current="page"' : ''}>${tab.label}</a>`;
    }).join('');
}
