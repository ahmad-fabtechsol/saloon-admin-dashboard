import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function DateRangePicker({ range, onChange, align = "start" }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-8 gap-2 text-xs font-normal">
          <CalendarIcon className="h-3.5 w-3.5" />
          {range?.from ? (
            range.to
              ? `${format(range.from, "MMM d")} – ${format(range.to, "MMM d, yyyy")}`
              : format(range.from, "MMM d, yyyy")
          ) : (
            <span className="text-muted-foreground">Pick date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <Calendar
          mode="range"
          selected={range}
          onSelect={onChange}
          numberOfMonths={2}
          initialFocus
        />
        {range?.from && (
          <div className="border-t p-2 text-right">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => onChange(undefined)}
            >
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
