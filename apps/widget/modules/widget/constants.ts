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