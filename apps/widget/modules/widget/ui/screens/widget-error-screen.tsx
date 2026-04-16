'use client'

import { useAtomValue } from "jotai"
import { AlertTriangleIcon } from "lucide-react"
import { errorMessageAtom } from "@/modules/widget/atoms/widget-atoms"
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header"
import { useWidgetStrings } from "@/modules/widget/hooks/use-widget-i18n"

export function WidgetErrorScreen() {
    const errorMessage = useAtomValue(errorMessageAtom)
    const { t } = useWidgetStrings()

    return (
        <>
            <WidgetHeader>
                <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
                    <p className="text-3xl">
                        {t("greeting.title")}
                    </p>
                    <p className="text-lg">
                        {t("greeting.subtitle")}
                    </p>
                </div>
            </WidgetHeader>
            <div className="flex flex-1 flex-col items-center justify-center gap-y-4 p-4 text-muted-foreground">
                <AlertTriangleIcon />
                <p className="text-sm">
                    {errorMessage || t("error.invalidConfig")}
                </p>
            </div>
        </>
    )
}
