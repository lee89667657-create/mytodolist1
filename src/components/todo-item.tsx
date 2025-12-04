"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, type Todo } from "@/types";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatDueDate(dueDate: string): string {
  const date = new Date(dueDate);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (diff < 0) return "마감 지남";
  if (hours < 1) return "1시간 이내";
  if (hours < 24) return `${hours}시간 남음`;
  return `${days}일 남음`;
}

function getDueDateColor(dueDate: string): string {
  const date = new Date(dueDate);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const hours = diff / (1000 * 60 * 60);

  if (hours < 0) return "bg-red-500 text-white";
  if (hours < 24) return "bg-orange-500 text-white";
  return "bg-blue-500 text-white";
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const category = CATEGORIES.find((c) => c.value === todo.category);

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-3 flex-wrap">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={() => onToggle(todo.id)}
        />
        <span
          className={`${
            todo.completed ? "line-through text-muted-foreground" : ""
          }`}
        >
          {todo.text}
        </span>
        {category && (
          <Badge variant="secondary" className="text-xs">
            <span
              className={`w-2 h-2 rounded-full mr-1 ${category.color}`}
            ></span>
            {category.label}
          </Badge>
        )}
        {todo.due_date && !todo.completed && (
          <Badge className={`text-xs ${getDueDateColor(todo.due_date)}`}>
            {formatDueDate(todo.due_date)}
          </Badge>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(todo.id)}
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        삭제
      </Button>
    </div>
  );
}
