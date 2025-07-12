"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 rdp", className)}
      classNames={{
        months: "rdp-months",
        month: "rdp-month",
        caption: "rdp-month_caption",
        caption_label: "text-sm font-medium",
        nav: "rdp-nav",
        nav_button_previous: "rdp-button_previous",
        nav_button_next: "rdp-button_next",
        table: "rdp-month_grid",
        head_row: "rdp-weekdays",
        head_cell: "rdp-weekday",
        row: "rdp-week",
        cell: "rdp-day",
        day: "rdp-day_button",
        day_selected: "rdp-selected",
        day_today: "rdp-today",
        day_outside: "rdp-outside",
        day_disabled: "rdp-disabled",
        day_range_middle: "rdp-range-middle",
        day_hidden: "rdp-hidden",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="rdp-chevron" />,
        IconRight: () => <ChevronRight className="rdp-chevron" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }