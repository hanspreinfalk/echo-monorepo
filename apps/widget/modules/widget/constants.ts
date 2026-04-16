export const WIDGET_SCREENS = [
    'error',
    'loading',
    'selection',
    'voice',
    'auth',
    'chat',
    'contact'
] as const

export const CONTACT_SESSION_KEY = 'echo_contact_session';

/** Parent embed script posts host page URL + console buffer with this type */
export const HOST_CONTEXT_MESSAGE_TYPE = 'echo-host-context';

/**
 * Parent embed posts identity (`Bryan.setUser(...)`) with this type so the
 * widget can find-or-create a contact session and skip the auth screen.
 */
export const HOST_IDENTITY_MESSAGE_TYPE = 'echo-host-identity';

/** Parent embed posts this when `Bryan.clearUser()` is called. */
export const HOST_CLEAR_IDENTITY_MESSAGE_TYPE = 'echo-host-clear-identity';

/**
 * Widget → embed: latest contact-session state. Lets the embed gate the
 * launcher button when `requireActiveSession` is on.
 */
export const WIDGET_SESSION_STATE_MESSAGE_TYPE = 'echo-widget-session-state';