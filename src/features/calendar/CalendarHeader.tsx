"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Button } from "@/components/ui/button";

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function CalendarHeader({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold">
        {format(currentDate, "yyyy년 M월", { locale: ko })}
      </h2>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onPrevMonth}>
          이전 달
        </Button>
        <Button variant="outline" size="sm" onClick={onToday}>
          오늘
        </Button>
        <Button variant="outline" size="sm" onClick={onNextMonth}>
          다음 달
        </Button>
      </div>
    </div>
  );
}
