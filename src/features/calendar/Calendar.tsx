"use client";

import { useState, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameDay,
  format,
} from "date-fns";
import { ko } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarCell } from "./CalendarCell";
import { CATEGORIES, type Todo } from "@/types";

interface CalendarProps {
  todos: Todo[];
  onToggleTodo: (id: string) => void;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function Calendar({ todos, onToggleTodo }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  const getTodosForDate = (date: Date): Todo[] => {
    return todos.filter((todo) => {
      if (!todo.due_date) return false;
      return isSameDay(new Date(todo.due_date), date);
    });
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const selectedCategory = selectedTodo
    ? CATEGORIES.find((c) => c.value === selectedTodo.category)
    : null;

  return (
    <div>
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
      />

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((day, index) => (
          <div
            key={day}
            className={`text-center text-sm font-medium py-2 ${
              index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : ""
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date) => (
          <CalendarCell
            key={date.toISOString()}
            date={date}
            currentMonth={currentDate}
            todos={getTodosForDate(date)}
            onTodoClick={setSelectedTodo}
          />
        ))}
      </div>

      {/* Todo Detail Dialog */}
      <Dialog open={!!selectedTodo} onOpenChange={() => setSelectedTodo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Checkbox
                checked={selectedTodo?.completed}
                onCheckedChange={() => {
                  if (selectedTodo) {
                    onToggleTodo(selectedTodo.id);
                    setSelectedTodo({
                      ...selectedTodo,
                      completed: !selectedTodo.completed,
                    });
                  }
                }}
              />
              <span
                className={selectedTodo?.completed ? "line-through opacity-60" : ""}
              >
                {selectedTodo?.text}
              </span>
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 pt-2">
                {selectedCategory && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">카테고리:</span>
                    <Badge variant="secondary">
                      <span
                        className={`w-2 h-2 rounded-full mr-1 ${selectedCategory.color}`}
                      />
                      {selectedCategory.label}
                    </Badge>
                  </div>
                )}
                {selectedTodo?.due_date && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">마감일:</span>
                    <span className="text-sm">
                      {format(new Date(selectedTodo.due_date), "yyyy년 M월 d일 HH:mm", {
                        locale: ko,
                      })}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">상태:</span>
                  <Badge variant={selectedTodo?.completed ? "default" : "outline"}>
                    {selectedTodo?.completed ? "완료" : "미완료"}
                  </Badge>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
