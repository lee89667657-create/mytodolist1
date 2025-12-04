"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Calendar } from "@/features/calendar/Calendar";
import type { Todo } from "@/types";

export default function CalendarPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchTodos();
    }
  }, [user]);

  const fetchTodos = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", user.id)
      .not("due_date", "is", null)
      .order("due_date", { ascending: true });

    if (error) {
      console.error("Error fetching todos:", error);
      toast.error("할 일을 불러오는데 실패했습니다.");
    } else {
      setTodos(data || []);
    }
    setLoading(false);
  };

  const handleToggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const { error } = await supabase
      .from("todos")
      .update({ completed: !todo.completed })
      .eq("id", id);

    if (error) {
      console.error("Error toggling todo:", error);
      toast.error("상태 변경에 실패했습니다.");
    } else {
      setTodos(
        todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      );
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">캘린더</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/">목록 보기</Link>
            </Button>
            <ThemeToggle />
            <Button variant="outline" onClick={signOut}>
              로그아웃
            </Button>
          </div>
        </div>

        {/* Calendar */}
        {loading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              로딩 중...
            </CardContent>
          </Card>
        ) : (
          <Calendar todos={todos} onToggleTodo={handleToggleTodo} />
        )}
      </div>
    </div>
  );
}
