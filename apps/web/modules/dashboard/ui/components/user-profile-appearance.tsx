"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Label } from "@workspace/ui/components/label"
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group"

const OPTIONS = [
    { value: "light" as const, label: "Light" },
    { value: "dark" as const, label: "Dark" },
    { value: "system" as const, label: "System" },
]

export function UserProfileAppearance() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="text-muted-foreground px-1 py-2 text-sm">Loading…</div>
        )
    }

    return (
        <div className="max-w-md space-y-4 px-1 py-2">
            <div>
                <h2 className="text-foreground text-base font-semibold">Interface theme</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                    Choose how Echo looks on this device. Your choice is saved in this browser.
                </p>
            </div>
            <RadioGroup
                value={theme ?? "system"}
                onValueChange={setTheme}
                className="gap-3"
            >
                {OPTIONS.map(({ value, label }) => (
                    <div key={value} className="flex items-center gap-3">
                        <RadioGroupItem value={value} id={`echo-theme-${value}`} />
                        <Label
                            htmlFor={`echo-theme-${value}`}
                            className="cursor-pointer font-normal"
                        >
                            {label}
                        </Label>
                    </div>
                ))}
            </RadioGroup>
        </div>
    )
}
