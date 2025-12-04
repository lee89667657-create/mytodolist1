"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TodoItem } from "@/components/todo-item";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  CATEGORIES,
  SORT_OPTIONS,
  type Todo,
  type CategoryValue,
  type SortValue,
} from "@/types";

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [newCategory, setNewCategory] = useState<CategoryValue>("default");
  const [newDueDate, setNewDueDate] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortValue>("newest");
  const [loading, setLoading] = useState(true);
  const notifiedTodos = useRef<Set<string>>(new Set());

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

  // 24시간 이내 마감 체크 및 토스트 알림
  useEffect(() => {
    if (todos.length === 0) return;

    const now = new Date();
    const urgentTodos = todos.filter((todo) => {
      if (!todo.due_date || todo.completed) return false;
      if (notifiedTodos.current.has(todo.id)) return false;

      const dueDate = new Date(todo.due_date);
      const diff = dueDate.getTime() - now.getTime();
      const hours = diff / (1000 * 60 * 60);

      return hours > 0 && hours <= 24;
    });

    urgentTodos.forEach((todo) => {
      const dueDate = new Date(todo.due_date!);
      const diff = dueDate.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));

      toast.warning(`마감 임박: ${todo.text}`, {
        description: `${hours > 0 ? `${hours}시간` : "1시간 이내"} 남았습니다!`,
        duration: 5000,
      });

      notifiedTodos.current.add(todo.id);
    });
  }, [todos]);

  const fetchTodos = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching todos:", error);
      toast.error("할 일을 불러오는데 실패했습니다.");
    } else {
      setTodos(data || []);
    }
    setLoading(false);
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim() || !user) return;

    // 현재 인증된 사용자 세션 확인
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      toast.error("로그인이 필요합니다. 다시 로그인해주세요.");
      router.push("/login");
      return;
    }

    const insertData = {
      user_id: session.user.id, // session에서 직접 user.id 사용
      text: newTodo.trim(),
      completed: false,
      category: newCategory,
      due_date: newDueDate ? newDueDate : null,
    };

    console.log("Inserting todo:", insertData);

    const { data, error } = await supabase
      .from("todos")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Error adding todo:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      toast.error(`할 일 추가 실패: ${error.message || "알 수 없는 오류"}`);
    } else if (data) {
      setTodos([data, ...todos]);
      setNewTodo("");
      setNewDueDate("");
      toast.success("할 일이 추가되었습니다!");
    }
  };

  const handleToggle = async (id: string) => {
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

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("todos").delete().eq("id", id);

    if (error) {
      console.error("Error deleting todo:", error);
      toast.error("삭제에 실패했습니다.");
    } else {
      setTodos(todos.filter((t) => t.id !== id));
      toast.success("할 일이 삭제되었습니다!");
    }
  };

  // 필터링 및 정렬된 todos
  const filteredAndSortedTodos = useMemo(() => {
    let result =
      filterCategory === "all"
        ? [...todos]
        : todos.filter((t) => t.category === filterCategory);

    switch (sortBy) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case "completed":
        result.sort((a, b) => Number(b.completed) - Number(a.completed));
        break;
      case "incomplete":
        result.sort((a, b) => Number(a.completed) - Number(b.completed));
        break;
    }

    return result;
  }, [todos, filterCategory, sortBy]);

  const completedCount = filteredAndSortedTodos.filter(
    (t) => t.completed
  ).length;
  const totalCount = filteredAndSortedTodos.length;

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My TodoList</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/calendar">캘린더</Link>
            </Button>
            <ThemeToggle />
            <Button variant="outline" onClick={signOut}>
              로그아웃
            </Button>
          </div>
        </div>

        {/* Add Todo Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">새 할 일 추가</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTodo} className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="할 일을 입력하세요..."
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  className="flex-1"
                />
                <Select
                  value={newCategory}
                  onValueChange={(v) => setNewCategory(v as CategoryValue)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${cat.color}`}
                          ></span>
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Input
                  type="datetime-local"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit">추가</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterCategory("all")}
          >
            전체
          </Button>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              variant={filterCategory === cat.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterCategory(cat.value)}
            >
              <span
                className={`w-2 h-2 rounded-full mr-1 ${cat.color}`}
              ></span>
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Sort & Stats */}
        <div className="flex items-center justify-between">
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>전체: {totalCount}</span>
            <span>완료: {completedCount}</span>
            <span>미완료: {totalCount - completedCount}</span>
          </div>
          <Select
            value={sortBy}
            onValueChange={(v) => setSortBy(v as SortValue)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Todo List */}
        <div className="space-y-2">
          {loading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                로딩 중...
              </CardContent>
            </Card>
          ) : filteredAndSortedTodos.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {filterCategory === "all"
                  ? "할 일이 없습니다. 새 할 일을 추가해보세요!"
                  : "이 카테고리에 할 일이 없습니다."}
              </CardContent>
            </Card>
          ) : (
            filteredAndSortedTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
