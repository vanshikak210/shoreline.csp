---
---
// Sidebar menu on the Shoreline account pages (_layouts/shoreline-account.html), styled
// like the OCS /profile sidebar. Same entries as the avatar menu, from account-model.js,
// so the two never disagree.

import { baseurl } from '{{ site.baseurl }}/assets/js/api/config.js';
import { accountTabs } from '{{ site.baseurl }}/assets/js/shoreline/account-model.js';

// 24x24 outline icons (stroke = currentColor), one per tab id.
const ICONS = {
    profile: '<path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"/>',
    preferences: '<path d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M1 14h6m2-6h6m2 8h6"/>',
    analytics: '<path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"/>',
};

function icon(id) {
    return `<svg class="sl-account__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[id] || ''}</svg>`;
}

/**
 * Fill `el` with this user's menu (signed-out visitors get the everyone-menu) and mark
 * `activeId` as the current page. Label text sits directly in the link, not in a <span>,
 * so the OCS theme's !important span color can't recolor it.
 */
export function renderAccountNav(el, user, activeId) {
    if (!el) return;
    el.innerHTML = accountTabs(user).map(tab => {
        const active = tab.id === activeId;
        return `<a class="sl-account__link${active ? ' is-active' : ''}" href="${baseurl}${tab.path}"${active ? ' aria-current="page"' : ''}>${icon(tab.id)}${tab.label}</a>`;
    }).join('');
}
