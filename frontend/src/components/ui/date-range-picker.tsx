"use client"

import React, { FC, useState } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { DateRange } from "react-day-picker" // react-day-picker の型をそのまま使用

// デフォルトの日付（Date オブジェクト、月は0-indexedなので4月は3、5月は4）
const defaultFrom = new Date(2025, 3, 26)
const defaultTo = new Date(2025, 4, 1)

export interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  onUpdate?: (values: { range: DateRange; rangeCompare?: DateRange }) => void
  initialDateFrom?: Date | string
  initialDateTo?: Date | string
  // 比較用の日付なども必要に応じて追加可能
  align?: "start" | "center" | "end"
  locale?: string
}

export const DatePickerWithRange: FC<DateRangePickerProps> = ({
  className,
  onUpdate,
  initialDateFrom = defaultFrom,
  initialDateTo = defaultTo,
  align = "start",
  locale = "en-US",
  ...props
}) => {
  // react-day-picker の DateRange 型を使用
  const [range, setRange] = useState<DateRange>({
    from: initialDateFrom instanceof Date ? initialDateFrom : new Date(initialDateFrom),
    to: initialDateTo instanceof Date ? initialDateTo : new Date(initialDateTo),
  })
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={className} {...props}>
      <Popover
        modal={true}
        open={isOpen}
        onOpenChange={(open: boolean) => setIsOpen(open)}
      >
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[300px] justify-start text-left font-normal">
            <CalendarIcon className="mr-2" />
            {range.from ? (
              range.to ? (
                <>
                  {format(range.from, "LLL dd, yyyy")} - {format(range.to, "LLL dd, yyyy")}
                </>
              ) : (
                format(range.from, "LLL dd, yyyy")
              )
            ) : (
              <span>Pick a date</span>
            )}
            <div className="ml-auto pl-1 opacity-60">
              {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            initialFocus
            mode="range"
            selected={range}
            onSelect={(selectedRange) => {
              if (selectedRange) {
                setRange(selectedRange)
                onUpdate?.({ range: selectedRange })
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

DatePickerWithRange.displayName = 'DatePickerWithRange'

