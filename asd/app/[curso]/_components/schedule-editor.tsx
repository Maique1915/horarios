"use client";

import type { Curso } from "@/types";
import { cn } from "@/lib/utils";

interface ScheduleEditorProps {
  course: Curso;
  selectedSlots: [number, number][];
  onSlotsChange: (slots: [number, number][]) => void;
}

export function ScheduleEditor({ course, selectedSlots, onSlotsChange }: ScheduleEditorProps) {

  const isSelected = (day: number, time: number) => {
    return selectedSlots.some(([d, t]) => d === day && t === time);
  };

  const handleSlotClick = (day: number, time: number) => {
    const newSlots = isSelected(day, time)
      ? selectedSlots.filter(([d, t]) => !(d === day && t === time))
      : [...selectedSlots, [day, time] as [number, number]];
    onSlotsChange(newSlots);
  };

  return (
    <div className="overflow-auto rounded-lg border max-h-96">
      <table className="w-full min-w-max border-collapse">
        <thead>
          <tr className="bg-muted/50">
            <th className="p-1.5 border text-xs font-medium text-muted-foreground w-16">Horário</th>
            {course._ds.map((day) => (
              <th key={day} className="p-1.5 border text-xs font-medium text-muted-foreground">{day.substring(0,3)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {course._hd.map((timeRange, timeIndex) => (
            <tr key={timeIndex}>
              <td className="p-1.5 border text-center text-[10px] text-muted-foreground">
                {timeRange[0]}<br/>{timeRange[1]}
              </td>
              {course._ds.map((_, dayIndex) => (
                <td
                  key={dayIndex}
                  onClick={() => handleSlotClick(dayIndex, timeIndex)}
                  className={cn(
                    "p-0.5 border h-10 cursor-pointer transition-colors",
                    isSelected(dayIndex, timeIndex)
                      ? "bg-accent/80"
                      : "hover:bg-accent/30"
                  )}
                ></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
