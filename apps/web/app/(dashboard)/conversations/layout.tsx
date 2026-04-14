import { ConversationsLayout } from "@/modules/dashboard/ui/layouts/conversations-layout";

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <ConversationsLayout>{children}</ConversationsLayout>;
}