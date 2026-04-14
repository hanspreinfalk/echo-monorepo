import { ArrowRightIcon, ArrowUpIcon, CheckIcon } from "lucide-react" 
import { cn } from "@workspace/ui/lib/utils"

interface ConversationStatusIconProps {
    status: "unresolved" | "escalated" | "resolved",
    className?: string
}

const statusConfig = {
    resolved: {
        icon: CheckIcon,
        bgColor: "bg-[#3FB62F]",
        iconClassName: "text-white",
    },
    unresolved: {
        icon: ArrowRightIcon,
        bgColor: "bg-border",
        iconClassName: "text-black dark:text-white",
    },
    escalated: {
        icon: ArrowUpIcon,
        bgColor: "bg-yellow-500",
        iconClassName: "text-white",
    },
} as const;

export const ConversationStatusIcon = ({
    status,
    className,
}: ConversationStatusIconProps) => {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <div className={cn("flex shrink-0 items-center justify-center rounded-full size-6", config.bgColor, className)}>
            <Icon className={cn("size-3 stroke-3", config.iconClassName)} />
        </div>
    )
}