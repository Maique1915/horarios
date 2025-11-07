import type { Curso, Disciplina } from "@/types";
import { cn } from "@/lib/utils";

interface ScheduleTableProps {
  course: Curso;
  schedule: Disciplina[];
  className?: string;
}

export function ScheduleTable({ course, schedule, className }: ScheduleTableProps) {
  const scheduleGrid: (Disciplina | null)[] = Array(course._da[0] * course._da[1]).fill(null);

  schedule.forEach((discipline) => {
    discipline._ho.forEach(([day, time]) => {
      const index = time * course._da[1] + day;
      if (index < scheduleGrid.length) {
        scheduleGrid[index] = discipline;
      }
    });
  });

  // Assign colors to disciplines
  const disciplineColors: { [key: string]: string } = {};
  const colors = [
    "bg-sky-200/50 border-sky-400 text-sky-800",
    "bg-emerald-200/50 border-emerald-400 text-emerald-800",
    "bg-amber-200/50 border-amber-400 text-amber-800",
    "bg-violet-200/50 border-violet-400 text-violet-800",
    "bg-rose-200/50 border-rose-400 text-rose-800",
    "bg-indigo-200/50 border-indigo-400 text-indigo-800",
    "bg-lime-200/50 border-lime-400 text-lime-800",
    "bg-cyan-200/50 border-cyan-400 text-cyan-800",
  ];
  let colorIndex = 0;

  schedule.forEach((disc) => {
    if (!disciplineColors[disc._id]) {
      disciplineColors[disc._id] = colors[colorIndex % colors.length];
      colorIndex++;
    }
  });
  
  const getCustomTime = (discipline: Disciplina, day: number, time: number) => {
    if (discipline._da) {
      const scheduleIndex = discipline._ho.findIndex(h => h[0] === day && h[1] === time);
      if (scheduleIndex !== -1 && discipline._da[scheduleIndex]) {
        return discipline._da[scheduleIndex];
      }
    }
    return null;
  }

  return (
    <div className={cn("overflow-x-auto rounded-lg border", className)}>
      <table className="w-full min-w-max border-collapse">
        <thead>
          <tr className="bg-muted">
            <th className="p-2 border text-sm font-medium text-muted-foreground w-[100px]">Horário</th>
            {course._ds.map((day) => (
              <th key={day} className="p-2 border text-sm font-medium text-muted-foreground">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {course._hd.map((timeRange, timeIndex) => (
            <tr key={timeIndex}>
              <td className="p-2 border text-center text-xs text-muted-foreground">
                {timeRange.join(" - ")}
              </td>
              {course._ds.map((_, dayIndex) => {
                const gridIndex = timeIndex * course._da[1] + dayIndex;
                const discipline = scheduleGrid[gridIndex];
                
                const customTime = discipline ? getCustomTime(discipline, dayIndex, timeIndex) : null;
                const displayTime = customTime ? customTime.join(" - ") : timeRange.join(" - ");

                if (!discipline) {
                  return <td key={dayIndex} className="p-0.5 border h-16"></td>;
                }
                
                // Check if this is the start of a multi-slot discipline block
                const isFirstSlot = !discipline._ho.some(([d, t]) => d === dayIndex && t === timeIndex -1);

                return (
                  <td key={dayIndex} className={cn("p-1 border h-16 align-top", disciplineColors[discipline._id])}>
                    {isFirstSlot && (
                       <div className="text-xs font-semibold leading-tight">
                        <p>{discipline._di}</p>
                        <p className="font-normal opacity-80">{discipline._re}</p>
                        {customTime && <p className="font-bold text-xs mt-1">{displayTime}</p>}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
