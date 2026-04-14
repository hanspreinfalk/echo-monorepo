"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import { CONTACT_PANEL_HIDDEN_COOKIE } from "../../constants";

type ContactPanelVisibilityContextValue = {
    /** When true, the contact panel is not shown (desktop); preference is stored in a cookie */
    contactPanelHidden: boolean;
    toggle: () => void;
    setContactPanelHidden: (hidden: boolean) => void;
};

const ContactPanelVisibilityContext =
    createContext<ContactPanelVisibilityContextValue | null>(null);

function writeContactPanelHiddenCookie(hidden: boolean) {
    if (typeof document === "undefined") {
        return;
    }
    document.cookie = `${CONTACT_PANEL_HIDDEN_COOKIE}=${hidden}; path=/; max-age=${31536000}; SameSite=Lax`;
}

export function ContactPanelVisibilityProvider({
    children,
    initialContactPanelHidden,
}: {
    children: ReactNode;
    initialContactPanelHidden: boolean;
}) {
    const [contactPanelHidden, setContactPanelHidden] = useState(
        initialContactPanelHidden,
    );

    const toggle = useCallback(() => {
        setContactPanelHidden((h) => {
            const next = !h;
            writeContactPanelHiddenCookie(next);
            return next;
        });
    }, []);

    const setContactPanelHiddenAndCookie = useCallback((hidden: boolean) => {
        setContactPanelHidden(hidden);
        writeContactPanelHiddenCookie(hidden);
    }, []);

    const value = useMemo(
        () => ({
            contactPanelHidden,
            toggle,
            setContactPanelHidden: setContactPanelHiddenAndCookie,
        }),
        [contactPanelHidden, toggle, setContactPanelHiddenAndCookie],
    );

    return (
        <ContactPanelVisibilityContext.Provider value={value}>
            {children}
        </ContactPanelVisibilityContext.Provider>
    );
}

export function useContactPanelVisibility() {
    const ctx = useContext(ContactPanelVisibilityContext);
    if (!ctx) {
        throw new Error(
            "useContactPanelVisibility must be used within ContactPanelVisibilityProvider",
        );
    }
    return ctx;
}
