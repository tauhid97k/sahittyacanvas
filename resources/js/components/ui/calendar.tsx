"use client"

import * as React from "react"
import {
    ChevronLeftIcon,
    ChevronRightIcon,
} from "lucide-react"
import { DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: React.ComponentProps<typeof DayPicker>) {
    const defaultClassNames = getDefaultClassNames()

    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-3", className)}
            classNames={{
                months: cn(
                    "relative flex flex-col gap-4 sm:flex-row",
                    defaultClassNames.months
                ),
                month: cn("flex flex-col gap-4", defaultClassNames.month),
                nav: cn(
                    "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
                    defaultClassNames.nav
                ),
                button_previous: cn(
                    buttonVariants({ variant: "outline" }),
                    "size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                    defaultClassNames.button_previous
                ),
                button_next: cn(
                    buttonVariants({ variant: "outline" }),
                    "size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                    defaultClassNames.button_next
                ),
                month_caption: cn(
                    "flex h-7 w-full items-center justify-center px-8",
                    defaultClassNames.month_caption
                ),
                caption_label: cn(
                    "text-sm font-medium",
                    defaultClassNames.caption_label
                ),
                weekdays: cn("flex", defaultClassNames.weekdays),
                weekday: cn(
                    "text-muted-foreground w-8 text-center text-xs font-normal",
                    defaultClassNames.weekday
                ),
                week: cn("mt-2 flex w-full", defaultClassNames.week),
                day: cn(
                    "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-range-start)]:rounded-l-md",
                    defaultClassNames.day
                ),
                day_button: cn(
                    "inline-flex items-center justify-center size-8 p-0 font-normal rounded-md hover:bg-accent hover:text-accent-foreground",
                    defaultClassNames.day_button
                ),
                range_start: cn(
                    "day-range-start [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground [&>button]:rounded-md [&.day-range-end>button]:rounded-md [&:not(.day-range-end)>button]:rounded-r-none",
                    defaultClassNames.range_start
                ),
                range_end: cn(
                    "day-range-end [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground [&>button]:rounded-md [&.day-range-start>button]:rounded-md [&:not(.day-range-start)>button]:rounded-l-none",
                    defaultClassNames.range_end
                ),
                selected: cn(
                    "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground",
                    defaultClassNames.selected
                ),
                today: cn("[&>button]:bg-accent [&>button]:text-accent-foreground", defaultClassNames.today),
                outside: cn(
                    "day-outside text-muted-foreground opacity-50",
                    defaultClassNames.outside
                ),
                disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
                range_middle: cn(
                    "[&>button]:bg-accent! [&>button]:text-accent-foreground! [&>button]:hover:bg-accent! [&>button]:hover:text-accent-foreground! [&>button]:rounded-none!",
                    defaultClassNames.range_middle
                ),
                hidden: cn("invisible", defaultClassNames.hidden),
                ...classNames,
            }}
            components={{
                Chevron: ({ orientation }) => {
                    const Icon = orientation === "left" ? ChevronLeftIcon : ChevronRightIcon
                    return <Icon className="size-4" />
                },
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
