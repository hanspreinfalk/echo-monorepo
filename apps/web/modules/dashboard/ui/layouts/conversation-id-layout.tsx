"use client";

import { ContactPanel } from "../components/contact-panel";
import { useContactPanelVisibility } from "../components/contact-panel-visibility-context";

export const ConversationIdLayout = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const { contactPanelHidden } = useContactPanelVisibility();

    return (
        <div className="flex h-full min-h-0 flex-1">
            {/* Main chat area — always full-width on mobile, shares space on desktop */}
            <div className="h-full min-h-0 min-w-0 flex-1 flex flex-col">
                {children}
            </div>

            {/* Contact info panel — hidden on mobile, shown on lg+ (unless user hid it) */}
            {!contactPanelHidden && (
                <div className="hidden lg:block h-full w-72 xl:w-80 shrink-0 border-l border-sidebar-border overflow-y-auto">
                    <ContactPanel />
                </div>
            )}
        </div>
    );
};
