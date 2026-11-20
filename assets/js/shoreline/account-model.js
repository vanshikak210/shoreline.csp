// Shoreline account types and the account tabs each one sees.
//
// Pure functions only (no DOM, storage or network) so they run under `node --test`.
// Accounts come from Flask /api/id, whose user carries `role`: "User" or "Admin".
// Admins are made by setting role = "Admin" on the account in Flask; Shoreline
// signup always creates "User". Hiding a tab is only a convenience: the Flask
// analytics route checks the Admin role itself.

export const ACCOUNT_TYPES = Object.freeze({ USER: 'user', ADMIN: 'admin' });

const ACCOUNT_TABS = [
    { id: 'profile', label: 'Profile', path: '/shoreline/profile', adminOnly: false },
    { id: 'preferences', label: 'Preferences', path: '/shoreline/preferences', adminOnly: false },
    { id: 'analytics', label: 'Analytics', path: '/shoreline/analytics', adminOnly: true },
];

/** True when the Flask user has the Admin role (case-insensitive; null-safe). */
export function isShorelineAdmin(user) {
    return String(user?.role || '').trim().toLowerCase() === 'admin';
}

/** "admin" or "user" for a signed-in account. */
export function accountType(user) {
    return isShorelineAdmin(user) ? ACCOUNT_TYPES.ADMIN : ACCOUNT_TYPES.USER;
}

/** Tabs to show this user, in menu order. Admins see Analytics as well. */
export function accountTabs(user) {
    const admin = isShorelineAdmin(user);
    return ACCOUNT_TABS
        .filter(tab => admin || !tab.adminOnly)
        .map(({ id, label, path }) => ({ id, label, path }));
}
