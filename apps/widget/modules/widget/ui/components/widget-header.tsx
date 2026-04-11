import { cn } from "@workspace/ui/lib/utils";

export function WidgetHeader({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <header
            className={cn(
                "bg-linear-to-b from-primary to-[var(--widget-gradient-end)] p-4 text-primary-foreground",
                className
            )}
        >
            {children}
        </header>
    )
}