import { cookies } from "next/headers";

import { CONTACT_PANEL_HIDDEN_COOKIE } from "../../constants";
import { ContactPanelVisibilityProvider } from "../components/contact-panel-visibility-context";
import { ConversationsLayoutClient } from "./conversations-layout-client";

export async function ConversationsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const initialContactPanelHidden =
        cookieStore.get(CONTACT_PANEL_HIDDEN_COOKIE)?.value === "true";

    return (
        <ContactPanelVisibilityProvider
            initialContactPanelHidden={initialContactPanelHidden}
        >
            <ConversationsLayoutClient>{children}</ConversationsLayoutClient>
        </ContactPanelVisibilityProvider>
    );
}
