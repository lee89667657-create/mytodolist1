"use client";

import { format, isToday, isSameMonth } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, type Todo } from "@/types";
import { cn } from "@/lib/utils";

interface CalendarCellProps {
  date: Date;
  currentMonth: Date;
  todos: Todo[];
  onTodoClick: (todo: Todo) => void;
}

export function CalendarCell({
  date,
  currentMonth,
  todos,
  onTodoClick,
}: CalendarCellProps) {
  const isCurrentMonth = isSameMonth(date, currentMonth);
  const isTodayDate = isToday(date);

  return (
    <Card
      className={cn(
        "min-h-[100px] p-2 transition-colors",
        !isCurrentMonth && "opacity-40 bg-muted/50",
        isTodayDate && "ring-2 ring-primary"
      )}
    >
      <div
        className={cn(
          "text-sm font-medium mb-1",
          isTodayDate && "text-primary font-bold"
        )}
      >
        {format(date, "d")}
      </div>
      <div className="space-y-1">
        {todos.slice(0, 3).map((todo) => {
          const category = CATEGORIES.find((c) => c.value === todo.category);
          return (
            <button
              key={todo.id}
              onClick={() => onTodoClick(todo)}
              className={cn(
                "w-full text-left text-xs p-1 rounded truncate transition-colors",
                "hover:bg-accent",
                todo.completed && "line-through opacity-60"
              )}
            >
              <span
                className={cn(
                  "inline-block w-2 h-2 rounded-full mr-1",
                  category?.color || "bg-gray-500"
                )}
              />
              {todo.text}
            </button>
          );
        })}
        {todos.length > 3 && (
          <Badge variant="secondary" className="text-xs">
            +{todos.length - 3}개 더
          </Badge>
        )}
      </div>
    </Card>
  );
}
